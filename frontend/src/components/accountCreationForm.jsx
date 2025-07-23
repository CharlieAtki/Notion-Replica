import {useState} from "react";
import {Link} from "react-router-dom";

const AccountCreationForm = () => {
    const [input, setInput] = useState({ email: "", password: "", organisationName: "" });
    const [passwordInputError, setPasswordInputError] = useState(false);
    const [passwordInputLengthError, setPasswordInputLengthError] = useState(false);
    const [emailInputError, setEmailInputError] = useState(false);
    const [emailInputValidityError, setEmailInputValidityError] = useState(false);
    const [organisationInputError, setOrganisationInputError] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const emailValidityCheck = (email) => email.includes("@"); // Checking to see whether there is an @ character

    const handleSubmit = async () => {
        event.preventDefault(); // prevent default form submit behavior
        setEmailInputError(false);
        setPasswordInputError(false);
        setPasswordInputLengthError(false);
        setEmailInputValidityError(false);
        setOrganisationInputError(false);

        let hasError = false;

        if (!input.email) {
            setEmailInputError(true);
            hasError = true;
        } else if (!emailValidityCheck(input.email)) {
            setEmailInputValidityError(true);
            hasError = true;
        }

        if (!input.password) {
            setPasswordInputError(true);
            hasError = true;
        } else if (input.password.length < 8) {
            setPasswordInputLengthError(true);
            hasError = true;
        } else if (!input.organisationName) {
            setOrganisationInputError(true);
            hasError = true;
        }

        if (hasError) return;

        try {
            const response = await fetch(`${backendUrl}/api/user-unAuth/createUserAccount`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(input)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.location.href = "/dashboard";
            } else { // Identifying the cause of the Error
                if (data.field === "email") {
                    setEmailInputError(true);
                } else if (data.field === "password") {
                    setPasswordInputError(true);
                } else if (data.field === "organisationName") {
                    setOrganisationInputError(true);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInput((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                    Sign in to your account
                </h2>
                <form className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            value={input.email}
                            onChange={handleChange}
                        />
                        {emailInputError && <p className="text-red-500 text-sm mt-1">Email already taken</p>}
                        {emailInputValidityError && <p className="text-red-500 text-sm mt-1">Invalid email</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            value={input.password}
                            onChange={handleChange}
                        />
                        {passwordInputLengthError && <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>}
                        {passwordInputError && <p className="text-red-500 text-sm mt-1">Invalid password</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="organisationName" className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            Organisation Name
                        </label>
                        <input
                            type="text"
                            id="organisationName"
                            name="organisationName"
                            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            value={input.organisationName}
                            onChange={handleChange}
                        />
                        {organisationInputError && <p className="text-red-500 text-sm mt-1">Organisation name already taken</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                        onClick={handleSubmit}
                    >
                        Create Account
                    </button>
                    <Link
                      to="/login"
                      className="text-sm flex items-center justify-center text-gray-700 dark:text-gray-300 hover:underline"
                    >
                      Already got an account?
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default AccountCreationForm;