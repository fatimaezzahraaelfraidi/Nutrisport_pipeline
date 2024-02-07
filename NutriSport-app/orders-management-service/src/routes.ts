import { Controller } from "./controller/Controller";

export const Routes = [{
    method: "post",
    route: "/api/orders-management/orderOffer/:sportifSessionId/:offerId/:method",
    controller: Controller,
    action: "placeOrderBasedOnOffers"
}, {
    method: "post",
    route: "/api/orders-management/orderDevis/:sportifSessionId/:devisId/:method",
    controller: Controller,
    action: "placeOrderBasedOnDevis"
}, {
    method: "get",
    route: "/api/orders-management/orders/:sportifSessionId",
    controller: Controller,
    action: "getOrdersBySportifId"
}, {
    method: "post",
    route: "/api/orders-management/orders/:orderId/:status",
    controller: Controller,
    action: "setOrderStatus"
}, {
    method: "post",
    route: "/api/orders-management/preparators/:orderId/:rank",
    controller: Controller,
    action: "setRankPreparator"
},{
    method: "get",
    route: "/api/orders-management/orders/status/:orderId",
    controller: Controller,
    action: "getOrderStatus"
},{
    method: "get",
    route: "/api/orders-management/countOrders/:sportifIdSession",
    controller: Controller,
    action: "getCountOrdersOfNearbyOffers"
},
{
    method: "get",
    route: "/api/orders-management/orders/preparatorOrders/:preparatorIdSession",
    controller: Controller,
    action: "getPreparatorOrders"
},
,{
    method: "post",
    route: "/api/orders-management/statusPayment/:orderId",
    controller: Controller,
    action: "setIsPaid"
    
},{
    method: "get",
    route: "/api/orders-management/:orderId",
    controller: Controller,
    action: "getOrderById"
},
{
    method: "get",
    route: "/api/orders-management/orderDevisHistory/:sportifSessionId",
    controller: Controller,
    action: "getOrderBasedOnDevisId"
},
]