const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')
const config = require('config')
const request = require('request')
const mongoose = require('mongoose')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route  GET api/profile/me
// @desc   Get current user profile
// @access Private
router.get(
    '/me',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({
                user: req.user.id
            })
            .populate('user', ['name', 'avatar'])

            if(!profile) {
                return res.status(400).json({msg: 'There is no profile for this user'})
            }

            res.json(profile)
        } catch(err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
})

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required')
            .not()
            .isEmpty(),
            check('skills', 'Skills is required')
            .not()
            .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        // destructure the request
        const {
            company,
            website,
            location,
            bio,
            status,
            github_user_name,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body;

        // build a profile
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (github_user_name) profileFields.github_user_name = github_user_name;
        if (skills) {
        profileFields.skills = skills.split(',').map((skill) => skill.trim());
        }

        // Build socialFields object
        profileFields.social = {};

        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;
        try {
            let profile = await Profile.findOne({ user: req.user.id });

            // update profile if already exists
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
                );

                return res.json(profile);
            }

            // create profile
            profile = new Profile(profileFields);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }

    }
)

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


    // @route    GET api/profile/user/:user_id
    // @desc     Get profile by user ID
    // @access   Public
    router.get('/user/:user_id', async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.params.user_id,
      })
      .populate('user', ['name', 'avatar']);
  
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Profile not found' });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  });

    // @route    DELETE api/profile
    // @desc     Delete profile, user & posts
    // @access   Private
    router.delete('/', auth, async (req, res) => {
    try {
        // remove profile
        await Profile.findOneAndUpdate({ user: req.user.id }, {$set: {deleted: true}}),
        //remove user
        await User.findOneAndUpdate({ _id: req.user.id }, {$set: {deleted: true}}),
        res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

    // @route    PUT api/profile/experience
    // @desc     Add profile experience
    // @access   Private
    router.put(
    '/experience',
    [
      auth,
      [
        check('title', 'Title is required').notEmpty(),
        check('company', 'Company is required').notEmpty(),
        check(
          'from',
          'From date is required and needs to be from the past'
        ).notEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { title, company, location, from, to, current, description } =
        req.body;
  
      const newExp = { title, company, location, from, to, current, description };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(newExp);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

  // @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
  
      const removeIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);
  
      profile.experience.splice(removeIndex, 1);
  
      await profile.save();
  
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required').notEmpty(),
        check('degree', 'Degree is required').notEmpty(),
        check('field_of_study', 'Field of study is required').notEmpty(),
        check(
          'from',
          'From date is required and needs to be from the past'
        ).notEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { school, degree, field_of_study, from, to, current, description } =
        req.body;
  
      const newEdu = {
        school,
        degree,
        field_of_study,
        from,
        to,
        current,
        description,
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/profile/education/:edu_id
  // @desc     Delete education from profile
  // @access   Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const removeIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);
  
      profile.education.splice(removeIndex, 1);
  
      await profile.save();
  
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
  // @route    GET api/profile/github/:username
  // @desc     Get user repos from Github
  // @access   Public
  router.get('/github/:username', async (req, res) => {
    try {
      const options = {
        uri: `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${config.get(
          'githubClientId'
        )}&client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers: {
          'user-agent': 'node.js',
        },
      };
  
      request(options, (error, response, body) => {
        if (error) console.error(error);
  
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: 'No Github profile found' });
        }
  
        res.json(JSON.parse(body));
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send(`Server error`);
    }
  });



module.exports = router