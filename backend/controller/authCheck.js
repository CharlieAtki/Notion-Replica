// This API is used to check whether the user has logged in. In other words, whether a session has been created
export const authCheck = async (req, res) => {

    // Setting headers for Safari
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Content-Type', 'application/json');

    // Checking if a session has been initialised
    if (req.session.user) {
        return res.status(200).json({
            success: true,
            message: 'Authentication Successful!'
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "No session present"
        });
    }
}