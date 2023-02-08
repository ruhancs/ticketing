import express from 'express';

import { currentUser } from '@ruhancstickets/common';

const currentUserRouter = express.Router()

currentUserRouter.get('/api/users/currentuser',currentUser, (req,res) => {
    return res.send({currentUser: req.currentUser || null})
})

export { currentUserRouter };