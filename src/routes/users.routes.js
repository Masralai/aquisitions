import { fetchAllUsers } from "#controllers/users.controller.js"
import e from "express"

const router = e.Router()

router.get('/',fetchAllUsers)
router.get('/:id',(req,res)=>res.send('GET /users/:id'))
router.put('/:id',(req,res)=>res.send('PUT /users/:id'))
router.delete('/:id',(req,res)=>res.send('DELETE /users/:id'))

export default router