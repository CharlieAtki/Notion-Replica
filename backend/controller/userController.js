import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import Organisation from "../models/Organisation.js"; // instead of 'bcrypt' - Had incompatibility errors with docker

// Num of times the hashing algorithm is applied
const saltRounds = 10;

export const userCreation = async (req, res) => {
    try {
        const existingEmailCheck = await User.findOne({email: req.body.email});
        if (existingEmailCheck) {
            return res.status(400).send({
                success: false,
                message: "Email already exists",
                field: "email"
            });
        }

        // Checking to see if the organisation name is already taken
        const existingOrganisationCheck = await Organisation.findOne({name: req.body.organisationName});
        if (existingOrganisationCheck) {
            return res.status(400).send({
                success: false,
                message: "Organisation already exists",
                field: "organisationName"
            });
        }
        const passwordString = String(req.body.password);
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Creating the user account (the object in the MongoDb database)
        const user = new User({
            email: req.body.email,
            hashedPassword: hashedPassword
        });
        await user.save();

        // Creating the organisation document
        const org = new Organisation({
            name: req.body.organisationName || `${user.email.split('@')[0]}'s Org`,
            // slug: generateUniqueSlug(user.email), // You’ll need to define this
            createdBy: user._id,
            members: [user._id]
        })
        await org.save();

        // Updating the users org information (adding the created org to the user document)
        user.orgs = [{
            orgId: org._id,
            name: org.name,
            role: "Owner",
            joinedAt: new Date(),
        }]
        await user.save();

        // Updating the currentOrgId
        user.currentOrgId = org._id
        await user.save();

        // Set session - Allows the user to login on account creation too
        req.session.user = {
            id: user._id,
            email: req.body.email,
            orgs: [
                {
                    orgId: org._id,
                    role: "Owner"
                }
            ],
            currentOrgId: org._id
        };

        return res.status(201).send({
            success: true,
            message: "User created",
            user,
            org
        }); // sending the document information to the frontend / where the request was made

    } catch (error) {
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

export const userLogin = async (req, res) => {
    const passwordString = String(req.body.password);

    try {
        const searchedUser = await User.findOne({email: req.body.email});
        if (!searchedUser) {
            return res.status(400).send({
                success: false,
                message: "User does not exist",
                field: "email"
            });
        }

        const match = await bcrypt.compare(passwordString, searchedUser.hashedPassword)
        if (match) {

            // Set session
            req.session.user = {
                id: searchedUser._id,
                email: searchedUser.email,
                // Use .map() to iterate over the orgs array
                orgs: searchedUser.orgs.map(org => ({
                    orgId: org.orgId,
                    role: org.role
                })),
                currentOrgId: searchedUser.currentOrgId
            };

            await new Promise((resolve, reject) => {
                req.session.save((error) => {
                    if (error) reject(error);
                    resolve();
                });
            });

            // Setting Headers for Safari
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);


            return res.status(200).json({
                success: true,
                message: "Password match",
            });
        } else {
            return res.status(401).send({
                success: false,
                message: "Incorrect password",
                field: "password"
            })
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const fetchCurrentUser = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No session user found",
            });
        }

        // Find the user without modifying their data
        const user = await User.findOne({ email: req.session.user.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const userLogout = async (req, res) => {
    try {
        // checks is the session exists
        if (!req.session) {
            return res.status(401).send({
                success: false,
                message: "No session present"
            });
        }

        // Convert callback-based session.destroy() to Promise
        await new Promise((resolve, reject) => { // Creates a new promise
            // Calling session.destroy() which expects a callback
            req.session.destroy(error => {
                // If errors exist, reject the Promise with error
                // If no error, resolve the Promise with no value
                error ? reject(error) : resolve()
            });
        });

        // Clear cookie with matching settings
        res.clearCookie('connect.sid', {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'none',
            domain: undefined
        });

        // Send successful response
        return res.status(200).send({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};