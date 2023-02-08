import express from 'express';

const signoutRouter = express.Router()

signoutRouter.post('/api/users/signout', (req,res) => {
    req.session = null;

    res.send({})
})

export { signoutRouter };