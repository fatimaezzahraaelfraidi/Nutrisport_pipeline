import { Controller } from "./controller/Controller"

export const Routes = [{
    method: "get",
    route: "/api/offers-and-requests-management/psessions",
    controller: Controller,
    action: "psAll"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/ssessions",
    controller: Controller,
    action: "ssAll"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/offers/:preparatorSessionId",
    controller: Controller,
    action: "getOffersByPreparatorId"
},{
    method: "get",
    route: "/api/offers-and-requests-management/offers/id/:offerId",
    controller: Controller,
    action: "getOfferById"
}, {
    method: "post",
    route: "/api/offers-and-requests-management/offers/:preparatorSessionId",
    controller: Controller,
    action: "saveOffer" 
}, {
    method: "get",
    route: "/api/offers-and-requests-management/demands/:sportifIdSession",
    controller: Controller,
    action: "getDemandsBySportifId"
},{
    method: "post",
    route: "/api/offers-and-requests-management/demands/:sportifIdSession",
    controller: Controller,
    action: "saveDemand"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/ssessions/:sportifIdSession",
    controller: Controller,
    action: "getNearbyOffers"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/psessions/:preparatorIdSession/:diameter?",
    controller: Controller,
    action: "getNearbyDemands"
}, {
    method: "post",
    route: "/api/offers-and-requests-management/devis/:preparatorIdSession/:demandId",
    controller: Controller,
    action: "proposeDevis"
}, {
    method: "patch",
    route: "/api/offers-and-requests-management/devis/:devisId/:method",
    controller: Controller,
    action: "acceptDevis"
},{
    method: "get",
    route: "/api/offers-and-requests-management/devis/preparator/:preparatorIdSession",
    controller: Controller,
    action: "getDevisOfPreparator"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/devis/demand/:demandId",
    controller: Controller,
    action: "getDevisOfDemand"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/allDevis/:demandId/:preparatorId",
    controller: Controller,
    action: "getAllDevisForDemand"
},{
    method: "get",
    route: "/api/offers-and-requests-management/devis/:devisId",
    controller: Controller,
    action: "getDevis"
}, {
    method: "patch",
    route: "/api/offers-and-requests-management/offer/:offerId/:availability",
    controller: Controller,
    action: "setOfferAvailability"
}, {
    method: "get",
    route: "/api/offers-and-requests-management/demandOfDevis/:devisId",
    controller: Controller,
    action: "getDemandOfDevis"
}]