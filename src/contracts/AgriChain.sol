// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AgriChain
 * @dev Main contract for the AgriChain farm-to-buyer marketplace
 */
contract AgriChain {
    // Define the Crop Listing struct
    struct CropListing {
        uint id;
        address farmer;
        string cropType;
        uint quantity;
        uint pricePerUnit;
        string location;
        uint harvestDate;
        string ipfsHash; // Hash to the image stored on IPFS
        bool isActive;
        uint timestamp;
    }

    // Define the Offer struct
    struct Offer {
        uint id;
        uint listingId;
        address buyer;
        uint quantity;
        uint pricePerUnit;
        Status status;
        uint timestamp;
    }

    // Define the order status
    enum Status { 
        Listed,    // Initial state when a crop is listed
        Offered,   // When a buyer makes an offer
        Accepted,  // When a farmer accepts an offer
        InTransit, // When the crop is being transported
        Delivered, // When the crop is delivered
        Disputed,  // When there's a dispute
        Completed, // When the transaction is completed
        Cancelled  // When the offer is cancelled
    }

    // State variables
    uint private nextListingId = 1;
    uint private nextOfferId = 1;
    
    // Mappings
    mapping(uint => CropListing) public cropListings;
    mapping(uint => Offer) public offers;
    mapping(address => uint[]) public farmerListings;
    mapping(address => uint[]) public buyerOffers;
    
    // Events
    event CropListed(uint indexed listingId, address indexed farmer, string cropType, uint quantity, uint pricePerUnit);
    event OfferMade(uint indexed offerId, uint indexed listingId, address indexed buyer, uint quantity, uint pricePerUnit);
    event OfferAccepted(uint indexed offerId, uint indexed listingId, address indexed farmer);
    event StatusUpdated(uint indexed offerId, Status status);
    event DeliveryConfirmed(uint indexed offerId, address indexed buyer);
    event DisputeRaised(uint indexed offerId, address indexed raiser, string reason);
    
    // Modifiers
    modifier onlyFarmer(uint listingId) {
        require(cropListings[listingId].farmer == msg.sender, "Only the farmer can call this function");
        _;
    }
    
    modifier onlyBuyer(uint offerId) {
        require(offers[offerId].buyer == msg.sender, "Only the buyer can call this function");
        _;
    }
    
    modifier listingExists(uint listingId) {
        require(listingId > 0 && listingId < nextListingId, "Listing does not exist");
        _;
    }
    
    modifier offerExists(uint offerId) {
        require(offerId > 0 && offerId < nextOfferId, "Offer does not exist");
        _;
    }

    /**
     * @dev Function for a farmer to list a crop
     */
    function listCrop(
        string memory cropType,
        uint quantity,
        uint pricePerUnit,
        string memory location,
        uint harvestDate,
        string memory ipfsHash
    ) public returns (uint) {
        require(bytes(cropType).length > 0, "Crop type cannot be empty");
        require(quantity > 0, "Quantity must be greater than zero");
        require(pricePerUnit > 0, "Price per unit must be greater than zero");
        
        uint listingId = nextListingId++;
        
        cropListings[listingId] = CropListing({
            id: listingId,
            farmer: msg.sender,
            cropType: cropType,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            location: location,
            harvestDate: harvestDate,
            ipfsHash: ipfsHash,
            isActive: true,
            timestamp: block.timestamp
        });
        
        farmerListings[msg.sender].push(listingId);
        
        emit CropListed(listingId, msg.sender, cropType, quantity, pricePerUnit);
        
        return listingId;
    }
    
    /**
     * @dev Function for a buyer to make an offer on a crop listing
     */
    function makeOffer(
        uint listingId, 
        uint quantity
    ) public payable listingExists(listingId) returns (uint) {
        CropListing storage listing = cropListings[listingId];
        
        require(listing.isActive, "Listing is not active");
        require(quantity > 0 && quantity <= listing.quantity, "Invalid quantity");
        require(msg.value >= quantity * listing.pricePerUnit, "Insufficient payment");
        
        uint offerId = nextOfferId++;
        
        offers[offerId] = Offer({
            id: offerId,
            listingId: listingId,
            buyer: msg.sender,
            quantity: quantity,
            pricePerUnit: listing.pricePerUnit,
            status: Status.Offered,
            timestamp: block.timestamp
        });
        
        buyerOffers[msg.sender].push(offerId);
        
        emit OfferMade(offerId, listingId, msg.sender, quantity, listing.pricePerUnit);
        
        return offerId;
    }
    
    /**
     * @dev Function for a farmer to accept an offer
     */
    function acceptOffer(uint offerId) public offerExists(offerId) {
        Offer storage offer = offers[offerId];
        uint listingId = offer.listingId;
        
        require(cropListings[listingId].farmer == msg.sender, "Only the farmer can accept the offer");
        require(offer.status == Status.Offered, "Offer can only be accepted if it is in 'Offered' status");
        
        offer.status = Status.Accepted;
        
        emit OfferAccepted(offerId, listingId, msg.sender);
        emit StatusUpdated(offerId, Status.Accepted);
    }
    
    /**
     * @dev Function to update the status of an offer
     */
    function updateStatus(uint offerId, Status newStatus) public offerExists(offerId) {
        Offer storage offer = offers[offerId];
        uint listingId = offer.listingId;
        
        // Only the farmer can update certain statuses
        if (newStatus == Status.InTransit || newStatus == Status.Delivered) {
            require(cropListings[listingId].farmer == msg.sender, "Only the farmer can update to this status");
        }
        
        // Only the buyer can confirm delivery
        if (newStatus == Status.Completed) {
            require(offer.buyer == msg.sender, "Only the buyer can complete the transaction");
            require(offer.status == Status.Delivered, "Offer must be in 'Delivered' status to complete");
            
            // Transfer payment to farmer
            address payable farmerAddress = payable(cropListings[listingId].farmer);
            uint payment = offer.quantity * offer.pricePerUnit;
            farmerAddress.transfer(payment);
        }
        
        offer.status = newStatus;
        
        emit StatusUpdated(offerId, newStatus);
    }
    
    /**
     * @dev Function to raise a dispute
     */
    function raiseDispute(uint offerId, string memory reason) public offerExists(offerId) {
        Offer storage offer = offers[offerId];
        
        require(
            msg.sender == offer.buyer || msg.sender == cropListings[offer.listingId].farmer, 
            "Only the buyer or farmer can raise a dispute"
        );
        
        require(
            offer.status == Status.Accepted || 
            offer.status == Status.InTransit || 
            offer.status == Status.Delivered, 
            "Can only dispute during active transaction phases"
        );
        
        offer.status = Status.Disputed;
        
        emit DisputeRaised(offerId, msg.sender, reason);
        emit StatusUpdated(offerId, Status.Disputed);
    }
    
    /**
     * @dev Function to cancel an offer
     */
    function cancelOffer(uint offerId) public offerExists(offerId) {
        Offer storage offer = offers[offerId];
        
        require(
            offer.buyer == msg.sender || cropListings[offer.listingId].farmer == msg.sender, 
            "Only the buyer or farmer can cancel an offer"
        );
        
        require(
            offer.status == Status.Offered || offer.status == Status.Accepted, 
            "Can only cancel in 'Offered' or 'Accepted' status"
        );
        
        offer.status = Status.Cancelled;
        
        // Refund the buyer
        address payable buyerAddress = payable(offer.buyer);
        uint refund = offer.quantity * offer.pricePerUnit;
        buyerAddress.transfer(refund);
        
        emit StatusUpdated(offerId, Status.Cancelled);
    }
    
    /**
     * @dev Function to get all listings by a farmer
     */
    function getListingsByFarmer(address farmer) public view returns (uint[] memory) {
        return farmerListings[farmer];
    }
    
    /**
     * @dev Function to get all offers by a buyer
     */
    function getOffersByBuyer(address buyer) public view returns (uint[] memory) {
        return buyerOffers[buyer];
    }
    
    /**
     * @dev Function to get a crop listing
     */
    function getCropListing(uint listingId) public view listingExists(listingId) returns (
        uint id,
        address farmer,
        string memory cropType,
        uint quantity,
        uint pricePerUnit,
        string memory location,
        uint harvestDate,
        string memory ipfsHash,
        bool isActive,
        uint timestamp
    ) {
        CropListing memory listing = cropListings[listingId];
        return (
            listing.id,
            listing.farmer,
            listing.cropType,
            listing.quantity,
            listing.pricePerUnit,
            listing.location,
            listing.harvestDate,
            listing.ipfsHash,
            listing.isActive,
            listing.timestamp
        );
    }
    
    /**
     * @dev Function to get an offer
     */
    function getOffer(uint offerId) public view offerExists(offerId) returns (
        uint id,
        uint listingId,
        address buyer,
        uint quantity,
        uint pricePerUnit,
        Status status,
        uint timestamp
    ) {
        Offer memory offer = offers[offerId];
        return (
            offer.id,
            offer.listingId,
            offer.buyer,
            offer.quantity,
            offer.pricePerUnit,
            offer.status,
            offer.timestamp
        );
    }
}
