/*
const AsyncHandeler=(fn)=> async (req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 400).json({
            success: false,
            message: err.message
        })
    }
} 
export {AsyncHandeler};
*/

const AsyncHandeler=(fn)=>{
    (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>next(err))
    }
}
export {AsyncHandeler}