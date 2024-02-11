const router = require('express').Router()
const User = require('../models/user_model')
const bcrypt = require('bcrypt')
const {tokenExtractor} = require('../utils/middleware')

router.get('/user',async (request, response, next) => {
    try{
        const users = await User.find({})
            .populate('blogs',{title:1})
            .populate({ path: 'followers', options: { strictPopulate: false } })
            .populate({ path: 'follows', options: { strictPopulate: false } })
        response.json(users)
    } catch (error) {
        next(error)
    }
})
router.get('/user/:id',tokenExtractor,async (request, response, next) => {
    try{
        const id = request.params.id
        const userGet = await User.findById(id).populate({ path: 'followers', options: { strictPopulate: false } })
            .populate({ path: 'follows', options: { strictPopulate: false } })
        if (request.user._id){
        return response.status(200).json(userGet)
        }
        return response.status(404).json({error: 'Error gettig user/ Unauthorized'})
    } catch (error) {
        next(error)
    }
})
router.put('/user/follow/:id',tokenExtractor,async (request, response, next) => {
    try{
        const id = request.params.id
        const user = request.user
        const userToFollow = await User.findById(id).populate({ path: 'followers', options: { strictPopulate: false } })
            .populate({ path: 'follows', options: { strictPopulate: false } })
        if (id.toString() !== user.id.toString() ) {
            if(user.follows.includes(`${id}`) && userToFollow.follower.includes(`${user.id}`)) {
                user.follows.pull(id)
                userToFollow.follower.pull(user.id)
            } else {
                user.follows.push(id)
                userToFollow.follower.push(user.id)
            }
            await user.save()
            await userToFollow.save()
            return response.status(200).json(userToFollow)
        }
        return response.status(400).send({msg:'user can not follow themselves'})
    } catch (error) {
        next(error)
    }
})
router.post('/user',async (request, response, next) => {
    try{
        const { username, name, password} = request.body

        if (password.length < 3) {
            return response.status(400).json({ error: 'Password must be at least 3 characters long' });
        }
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password,saltRounds)

        const user = new User({ username, name, passwordHash})
        const savedUser = await user.save()

        response.json(savedUser)
    } catch (error) {
        next(error)
    }
})
module.exports = router