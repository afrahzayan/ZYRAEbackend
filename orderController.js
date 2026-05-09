// const orderModel = require("../../model/orderModel")
// const productModel = require("../../model/productModel")

// // CREATE ORDER
// const createOrder = async (req, res) => {
//     try {
//         const userId = req.user.userID

//         const {
//             items,
//             shippingAddress,
//             shippingCity,
//             shippingState,
//             shippingZip,
//             totalAmount,
//             paymentMethod
//         } = req.body

//         if (!items || items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No items in order"
//             })
//         }

//         const orderNumber = `ORD-${Date.now()}`

//         const formattedItems = await Promise.all(
//             items.map(async (item) => {

//                 const product = await productModel.findById(item.productId)

//                 if (!product) {
//                     throw new Error("Product not found")
//                 }

//                 if (product.stock < item.quantity) {
//                     throw new Error(`${product.name} is out of stock`)
//                 }

//                 // Reduce stock
//                 product.stock -= item.quantity
//                 await product.save()

//                 return {
//                     productId: product._id,
//                     name: product.name,
//                     price: product.price,
//                     quantity: item.quantity,
//                     image: product.image
//                 }
//             })
//         )

//         const order = await orderModel.create({
//             userId,
//             orderNumber,
//             items: formattedItems,
//             shippingAddress,
//             shippingCity,
//             shippingState,
//             shippingZip,
//             totalAmount,
//             paymentMethod: paymentMethod || "cod",
//             paymentStatus: "pending",
//             status: "processing"
//         })

//         res.status(201).json({
//             success: true,
//             message: "Order placed successfully",
//             data: order
//         })

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: "Error creating order",
//             error: err.message
//         })
//     }
// }

// // GET USER ORDERS
// const getUserOrders = async (req, res) => {
//     try {

//         const userId = req.user.userID

//         const orders = await orderModel
//             .find({ userId })
//             .sort({ createdAt: -1 })

//         res.status(200).json({
//             success: true,
//             data: orders
//         })

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: "Error fetching orders",
//             error: err.message
//         })
//     }
// }

// module.exports = {
//     createOrder,
//     getUserOrders
// }