// import React, { useState, useCallback, useRef, useEffect } from "react";
// import background_login from '../../public/background_login.png'
// import login_logo from "../../public/login_logo.png";
// import Authapi from '../components/api/Authapi';
// import { useUserdetails } from "../components/zustand/useUserdetails";
// import { useNavigate } from "react-router-dom";

// const BookMyTheatreHeader = () => (
//   <div className="absolute top-4 right-8 z-10">
//     <img
//       src={login_logo}
//       alt="Book My Theatre Logo"
//       className="w-[150px] h-20 object-contain"
//     />
//   </div>
// );

// // --- Modal Component ---
// const Modal = ({ isOpen, onClose, children, preventClose = false }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//       <div className="relative">
//         {children}
//         {!preventClose && (
//           <button
//             onClick={onClose}
//             className="absolute top-2 right-2 text-white hover:text-gray-300"
//             aria-label="Close modal"
//           >
//             ×
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };


// const LoginPage = () => {
//   const { updateAuthDetails } = useUserdetails();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [focusedElement, setFocusedElement] = useState(null);
//   const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
//   const navigate = useNavigate();
//   const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [verifycode, setVerifycode] = useState('');
//   const [qrCodeUrl, setQrCodeUrl] = useState(null);
//   const isAuthenticatedRef = useRef(false);
//   const [isSessionTimeoutModalVisible, setIsSessionTimeoutModalVisible] = useState(false);
//   const [countdown, setCountdown] = useState(10);
//   const sessionTimeoutRef = useRef(null);
//   const countdownIntervalRef = useRef(null);

//   // --- D-Pad Navigation State & Refs ---
//   const [activeSection, setActiveSection] = useState('FORM'); // FORM, MODAL
//   const [focusedIndex, setFocusedIndex] = useState(0); // 0: email, 1: password, 2: forgot, 3: login

//   const formRefs = useRef([]); // [email, password, forgot, login]
//   const otpOkButtonRef = useRef(null);

//   useEffect(() => {
//     // Auto-focus the first element on load
//     if (activeSection === 'FORM') {
//       formRefs.current[0]?.focus();
//     }
//   }, [activeSection]);

//   useEffect(() => {
//     if (isLoading) return; // Disable listener during login process

//     const handleKeyDown = (e) => {
//       e.preventDefault();

//       if (activeSection === 'MODAL') {
//         if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
//           otpOkButtonRef.current?.click();
//         }
//         return;
//       }

//       if (activeSection === 'FORM') {
//         if (e.key === 'ArrowDown') {
//           setFocusedIndex(prev => Math.min(3, prev + 1));
//         } else if (e.key === 'ArrowUp') {
//           setFocusedIndex(prev => Math.max(0, prev - 1));
//         } else if (e.key === 'Enter') {
//           formRefs.current[focusedIndex]?.click();
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [activeSection, focusedIndex, isLoading]);

//   // Effect to focus the element when index changes
//   useEffect(() => {
//     if (activeSection === 'FORM') {
//       formRefs.current[focusedIndex]?.focus();
//     } else if (activeSection === 'MODAL') {
//       otpOkButtonRef.current?.focus();
//     }
//   }, [focusedIndex, activeSection]);


//   const handleInputChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errorMessage) setErrorMessage(null);
//   };

//   console.log("use User Details", useUserdetails);

//   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   const validateForm = useCallback(() => {
//     if (!formData.email || !formData.password) {
//       setErrorMessage({ message: "Email and password are required." });
//       return false;
//     }
//     if (!emailPattern.test(formData.email)) {
//       setErrorMessage({ message: "Please enter a valid email address." });
//       return false;
//     }
//     return true;
//   }, [formData.email, formData.password]);

//   const fetchQRCode = async () => {
//     try {
//       const qrCodeResponse = await Authapi.get('/generateqrcode');
//       const qrCodeUrl = qrCodeResponse.data.qrCode;
//       const verifyQRCode = qrCodeResponse.data.verifycode;
//       setQrCodeUrl(qrCodeUrl);
//       setVerifycode(verifyQRCode);

//       // Reset session timeout - 10 minutes (600000ms)
//       if (sessionTimeoutRef.current) {
//         clearTimeout(sessionTimeoutRef.current);
//       }
//       sessionTimeoutRef.current = setTimeout(() => {
//         setIsSessionTimeoutModalVisible(true);
//         setCountdown(10);
//         startCountdown();
//       }, 6000); // 10 minutes
//       // }, 600000); // 10 minutes
//     } catch (error) {
//       console.error('Error fetching QR code:', error);
//     }
//   };

//   const startCountdown = () => {
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }

//     countdownIntervalRef.current = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(countdownIntervalRef.current);
//           handleRefreshQRCode();
//           return 10;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleRefreshQRCode = () => {
//     setIsSessionTimeoutModalVisible(false);
//     setCountdown(10);
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
//     fetchQRCode();
//   };

//   const handleCheckVerifyCode = async () => {
//     if (isAuthenticatedRef.current) return;

//     try {
//       const response = await Authapi.post('verifyqrcode', { verifycode });
//       const responseData = response.data;

//       if (responseData.status === 'success') {
//         isAuthenticatedRef.current = true;
//         localStorage.setItem('access_token', responseData.access_token);
//         localStorage.setItem('user_info', JSON.stringify(responseData.user_details));
//         updateAuthDetails(responseData.user_details, responseData.access_token);
//       } else if (responseData.status !== 'pending') {
//         setErrorMessage({ message: responseData.message });
//       }
//     } catch (error) {
//       console.error('QR verification error:', error);
//     }
//   };


//   const handleLogin = useCallback(async () => {
//     setIsLoading(true);
//     setErrorMessage(null);

//     if (!validateForm()) {
//       setIsLoading(false);
//       return;
//     }

//     const data = {
//       emailOrPhone: formData.email,
//       password: formData.password,
//       isEmail: true,
//     };

//     try {
//       const response = await Authapi.post("/user/signin", data);
//       const responseData = response.data;

//       if (responseData?.user_details?.is_deactivated) {
//         setErrorMessage({
//           message: "Your account is deactivated. Please contact support.",
//         });
//         return;
//       }

//       if (
//         responseData.status === "error" ||
//         responseData.status === "error_user_not_found" ||
//         responseData.status === "error_invalid_password"
//       ) {
//         setErrorMessage({ message: responseData.message });
//         return;
//       }

//       if (responseData.requiresOtp) {
//         setIsOtpModalVisible(true);
//         setActiveSection('MODAL');
//         setIsLoading(false);
//         return;
//       }

//       localStorage.setItem("access_token", responseData.access_token);
//       localStorage.setItem(
//         "user_info",
//         JSON.stringify(responseData.user_details)
//       );

//       updateAuthDetails(responseData.user_details, responseData.access_token);
//       // Use a timeout to ensure state updates and cleanup effects have time to run
//       setTimeout(() => {
//         if (navigate) navigate("/browse");
//       }, 50);
//     } catch (error) {
//       setErrorMessage({
//         message: "Something went wrong. Please try again later.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [formData, validateForm, navigate, updateAuthDetails]);

//   useEffect(() => {
//     fetchQRCode();

//     return () => {
//       if (sessionTimeoutRef.current) {
//         clearTimeout(sessionTimeoutRef.current);
//       }
//       if (countdownIntervalRef.current) {
//         clearInterval(countdownIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!verifycode) return;

//     const interval = setInterval(() => {
//       handleCheckVerifyCode();
//     }, 2000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [verifycode]);

//   return (
//     <div
//       className="relative flex flex-col w-screen h-screen bg-cover bg-center text-white font-sans overflow-hidden"
//       style={{
//         minHeight: "100vh",
//         height: "100vh",
//         width: "100vw",
//         backgroundImage: `url(${background_login})`,
//       }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/70" />

//       {/* Header */}
//       <BookMyTheatreHeader />

//       {/* Modals */}
//       {/* {isOtpModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//           <div className="bg-[#1a1a1a] p-10 rounded-xl w-[550px] text-center border border-gray-700 shadow-xl">
//             <p className="text-2xl font-semibold mb-8 leading-snug">
//               Please complete the signup process in the mobile app or browser
//               before logging in here.
//             </p>
//             <button
//               ref={otpOkButtonRef}
//               onClick={() => { setIsOtpModalVisible(false); setActiveSection('FORM'); }}
//               className="bg-red-700 hover:bg-red-600 py-3 px-10 rounded-md text-lg font-semibold outline-none focus:ring-4 focus:ring-white"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )} */}

//       {/* OTP Modal */}
//       <Modal
//         isOpen={isOtpModalVisible}
//         onClose={() => setIsOtpModalVisible(false)}
//       >
//         <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border border-gray-600">
//           <p className="text-white text-2xl mb-8 font-semibold">
//             Please complete the signup process in mobile app or browser to login here
//           </p>
//           <button
//             ref={otpOkButtonRef}
//             onClick={() => setIsOtpModalVisible(false)}
//             className="bg-red-700 hover:bg-red-800 py-3 px-12 rounded-md text-white font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
//           >
//             OK
//           </button>
//         </div>
//       </Modal>

//       {/* Forgot Password Modal */}
//       <Modal
//         isOpen={isForgotPasswordModalVisible}
//         onClose={() => setIsForgotPasswordModalVisible(false)}
//       >
//         <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border border-gray-600">
//           <p className="text-white text-2xl mb-8 font-semibold">
//             Forgot your password? <br />
//             Reset it using your browser at<br />
//             <span className="underline">https://uat.bookmytheatre.com/login</span>
//           </p>
//           <button
//             onClick={() => setIsForgotPasswordModalVisible(false)}
//             className="bg-red-700 hover:bg-red-800 py-3 px-12 rounded-md text-white font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
//           >
//             OK
//           </button>
//         </div>
//       </Modal>

//       {/* Session Timeout Modal */}
//       <Modal
//         isOpen={isSessionTimeoutModalVisible}
//         onClose={() => { }}
//         preventClose={true}
//       >
//         <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border-2 border-red-600">
//           <p className="text-red-500 text-3xl font-bold mb-4">
//             ⏱️ Session Timed Out
//           </p>
//           <p className="text-white text-2xl mb-6 font-semibold">
//             Your session has expired after 10 minutes of inactivity.
//           </p>
//           <p className="text-gray-300 text-xl mb-8">
//             A new QR code will be generated automatically in{' '}
//             <span className="text-red-500 font-bold text-2xl">{countdown}</span> seconds...
//           </p>
//           <div className="bg-gray-700 h-2 w-full rounded-full overflow-hidden">
//             <div
//               className="bg-red-600 h-full transition-all duration-1000"
//               style={{ width: `${(countdown / 10) * 100}%` }}
//             />
//           </div>
//         </div>
//       </Modal>


//       {/* Main Content */}
//       <div className="relative z-10 flex flex-1 flex-row items-stretch">
//         {/* Left Section */}
        
//         <div className="flex-1 p-16 flex flex-col justify-center">
//           <h1 className="text-white text-4xl font-bold mb-3 text-center">
//             Login to your account
//           </h1>
//           <h2 className="text-white text-xl font-semibold mb-2 text-center">
//             Scan QR code
//           </h2>
//           <p className="text-gray-300 text-base mb-4 text-center">
//             Use your mobile device's camera or a QR scanner to get started.
//           </p>

//           {qrCodeUrl && (
//             <img
//               src={qrCodeUrl}
//               alt="QR Code"
//               className="w-full h-[200px] object-contain"
//             />
//           )}

//           <div className="mt-6 flex flex-col items-center">
//             <div className="flex flex-row justify-center bg-[#1e1e1e] px-6 py-4 rounded-xl border border-gray-600">
//               <span
//                 className="text-white text-4xl font-extrabold tracking-[0.375rem] mx-1"
//                 style={{ fontFamily: 'monospace' }}
//               >
//                 {verifycode}
//               </span>
//             </div>

//             <p className="text-gray-400 text-base mt-3 text-center">
//               Enter this code on your mobile device to verify the TV login.
//             </p>
//           </div>

//           <p className="text-gray-400 text-base mt-4 text-center">
//             Keep the QR code clearly visible. This page will automatically update when the connection is established
//           </p>
//         </div>


//         {/* Right Section */}
//         {/* <div className="flex-1 flex flex-col justify-center px-20 py-12 bg-black/40 backdrop-blur-sm">
//           <h2 className="text-3xl font-semibold mb-4">Sign in with Email</h2>
//           <p className="text-gray-300 text-lg mb-8">
//             Enter your registered email and password below to continue.
//           </p>

//           <div className="mb-8">
//             <label className="block text-sm text-gray-400 mb-2">
//               Email Address
//             </label>
//             <input
//               ref={el => formRefs.current[0] = el}
//               type="email"
//               value={formData.email}
//               onChange={(e) => handleInputChange("email", e.target.value)}
//               placeholder="Enter your email"
//               className={`w-full bg-transparent border-b-2 text-white text-lg py-3 outline-none transition-all duration-200 ${focusedIndex === 0 ? 'border-red-600' : 'border-gray-500'}`}
//             />
//           </div>

//           <div className="mb-8">
//             <label className="block text-sm text-gray-400 mb-2">Password</label>
//             <input
//               ref={el => formRefs.current[1] = el}
//               type="password"
//               value={formData.password}
//               onChange={(e) => handleInputChange("password", e.target.value)}
//               placeholder="Enter your password"
//               className={`w-full bg-transparent border-b-2 text-white text-lg py-3 outline-none transition-all duration-200 ${focusedIndex === 1 ? 'border-red-600' : 'border-gray-500'}`}
//             />
//           </div>

//           {errorMessage && (
//             <p className="text-red-500 text-lg mb-6">{errorMessage.message}</p>
//           )}

//           <motion.button
//             onClick={handleLogin}
//             ref={el => formRefs.current[3] = el}
//             disabled={isLoading}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.97 }}
//             className={`w-full bg-red-700 hover:bg-red-600 py-4 rounded-lg text-xl font-bold tracking-wide shadow-xl transition outline-none ${focusedIndex === 3 ? 'ring-4 ring-white' : ''}`}
//           >
//             {isLoading ? "Logging in..." : "Login"}
//           </motion.button>
//         </div> */}

//         <div className="flex-1 p-16 flex flex-col justify-center border-l border-gray-700/50">
//           <h2 className="text-white text-2xl font-semibold mb-4">
//             Get started with your email.
//           </h2>
//           <p className="text-gray-300 text-lg mb-6">
//             Please enter your email and password to continue.
//           </p>

//           {/* Email Input */}
//           <div
//             className={`flex flex-row items-center pb-3 mb-10 border-b-2 transition-colors ${focusedElement === 'email' ? 'border-red-700' : 'border-gray-400'
//               }`}
//           >
//             <input
//               type="email"
//               ref={el => formRefs.current[0] = el}
//               onFocus={() => setFocusedElement('email')}
//               onBlur={() => setFocusedElement(null)}
//               className="flex-1 bg-transparent text-white text-xl p-0 outline-none placeholder-gray-400"
//               placeholder="Enter Email Address"
//               value={formData.email}
//               onChange={(e) => handleInputChange('email', e.target.value)}
//             />
//           </div>

//           {/* Password Input */}
//           <div
//             className={`flex flex-row items-center pb-3 mb-3 border-b-2 transition-colors ${focusedElement === 'password' ? 'border-red-700' : 'border-gray-400'
//               }`}
//           >
//             <input
//               type={isPasswordVisible ? 'text' : 'password'}
//               ref={el => formRefs.current[1] = el}
//               onFocus={() => setFocusedElement('password')}
//               onBlur={() => setFocusedElement(null)}
//               className="flex-1 bg-transparent text-white text-xl p-0 outline-none placeholder-gray-400"
//               placeholder="Enter Password"
//               value={formData.password}
//               onChange={(e) => handleInputChange('password', e.target.value)}
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter') {
//                   handleLogin();
//                 }
//               }}
//             />
//             <button
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//               onFocus={() => setFocusedElement('passwordToggle')}
//               onBlur={() => setFocusedElement(null)}
//               className={`ml-3 p-2 rounded transition-colors ${focusedElement === 'passwordToggle' ? 'bg-red-700' : 'bg-transparent'
//                 }`}
//             >
//               <span className="text-white text-2xl font-bold">
//                 {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
//               </span>
//             </button>
//           </div>

//           {/* Error Message */}
//           {errorMessage && (
//             <p className="text-red-500 text-lg mb-4">
//               {errorMessage.message}
//             </p>
//           )}

//           {/* Forgot Password Link */}
//           {/* <button
//               onClick={() => setIsForgotPasswordModalVisible(true)}
//               onFocus={() => setFocusedElement('forgotPassword')}
//               onBlur={() => setFocusedElement(null)}
//               className={`font-semibold mb-6 ml-auto transition-colors ${
//                 focusedElement === 'forgotPassword' ? 'text-[#c02628]' : 'text-gray-400'
//               }`}
//             >
//               Forgot password?
//             </button> */}

//           {/* Login Button */}
//           <button
//             onClick={handleLogin}
//             ref={el => formRefs.current[3] = el}
//             onFocus={() => setFocusedElement('loginBtn')}
//             onBlur={() => setFocusedElement(null)}
//             disabled={isLoading}
//             className={`bg-red-700 hover:bg-red-800 py-4 rounded-md shadow-2xl text-white text-xl font-bold text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusedElement === 'loginBtn' ? 'scale-105 border-2 border-white' : ''
//               }`}
//           >
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState, useCallback, useRef, useEffect } from "react";
import background_login from "../../public/background_login.png";
import login_logo from "../../public/login_logo.png";
import Authapi from "../components/api/Authapi";
import { useUserdetails } from "../components/zustand/useUserdetails";
import { useNavigate } from "react-router-dom";
import VirtualKeyboard from "../shared/VirtualKeyboard";

const BookMyTheatreHeader = () => (
  <div className="absolute top-4 right-8 z-10">
    <img
      src={login_logo}
      alt="Book My Theatre Logo"
      className="w-[150px] h-20 object-contain"
    />
  </div>
);

// --- Modal Component ---
const Modal = ({ isOpen, onClose, children, preventClose = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative">
        {children}
        {!preventClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
            aria-label="Close modal"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};


const LoginPage = () => {
  const { updateAuthDetails } = useUserdetails();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedElement, setFocusedElement] = useState(null);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const navigate = useNavigate();
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [verifycode, setVerifycode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const isAuthenticatedRef = useRef(false);
  const [isSessionTimeoutModalVisible, setIsSessionTimeoutModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const sessionTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // --- Virtual Keyboard State ---
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeInputField, setActiveInputField] = useState(null); // 'email' or 'password'

  // --- D-Pad Navigation State & Refs ---
  const [activeSection, setActiveSection] = useState('FORM'); // FORM, MODAL
  const [focusedIndex, setFocusedIndex] = useState(0); // 0: email, 1: password, 2: forgot, 3: login

  const formRefs = useRef([]); // [email, password, forgot, login]
  const otpOkButtonRef = useRef(null);

  useEffect(() => {
    // Auto-focus the first element on load
    if (activeSection === 'FORM') {
      formRefs.current[0]?.focus();
    }
  }, [activeSection]);

  useEffect(() => {
    if (isLoading) return; // Disable listener during login process

    const handleKeyDown = (e) => {
      e.preventDefault();

      if (activeSection === 'MODAL') {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
          otpOkButtonRef.current?.click();
        }
        return;
      }

      if (activeSection === 'FORM') {
        if (e.key === 'ArrowDown') {
          setFocusedIndex(prev => Math.min(3, prev + 1));
        } else if (e.key === 'ArrowUp') {
          setFocusedIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Enter') {
          formRefs.current[focusedIndex]?.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, focusedIndex, isLoading]);

  // Effect to focus the element when index changes
  useEffect(() => {
    if (activeSection === 'FORM') {
      formRefs.current[focusedIndex]?.focus();
    } else if (activeSection === 'MODAL') {
      otpOkButtonRef.current?.focus();
    }
  }, [focusedIndex, activeSection]);


  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleOpenKeyboard = (field) => {
    setActiveInputField(field);
    setKeyboardVisible(true);
  };

  const handleCloseKeyboard = () => {
    setKeyboardVisible(false);
    setActiveInputField(null);
  };

  const handleKeyboardInput = (char) => {
    if (activeInputField) {
      setFormData((prev) => ({
        ...prev,
        [activeInputField]: prev[activeInputField] + char,
      }));
      if (errorMessage) setErrorMessage(null);
    }
  };

  const handleKeyboardBackspace = () => {
    if (activeInputField) {
      setFormData((prev) => ({
        ...prev,
        [activeInputField]: prev[activeInputField].slice(0, -1),
      }));
    }
  };

  const handleKeyboardClear = () => {
    if (activeInputField) {
      setFormData((prev) => ({
        ...prev,
        [activeInputField]: '',
      }));
    }
  };

  console.log("use User Details", useUserdetails);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = useCallback(() => {
    if (!formData.email || !formData.password) {
      setErrorMessage({ message: "Email and password are required." });
      return false;
    }
    if (!emailPattern.test(formData.email)) {
      setErrorMessage({ message: "Please enter a valid email address." });
      return false;
    }
    return true;
  }, [formData.email, formData.password]);

  const fetchQRCode = async () => {
    try {
      const qrCodeResponse = await Authapi.get('/generateqrcode');
      const qrCodeUrl = qrCodeResponse.data.qrCode;
      const verifyQRCode = qrCodeResponse.data.verifycode;
      setQrCodeUrl(qrCodeUrl);
      setVerifycode(verifyQRCode);

      // Reset session timeout - 10 minutes (600000ms)
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      sessionTimeoutRef.current = setTimeout(() => {
        setIsSessionTimeoutModalVisible(true);
        setCountdown(10);
        startCountdown();
      }, 600000); // 10 minutes
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleRefreshQRCode();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRefreshQRCode = () => {
    setIsSessionTimeoutModalVisible(false);
    setCountdown(10);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    fetchQRCode();
  };

  const handleCheckVerifyCode = async () => {
    if (isAuthenticatedRef.current) return;

    try {
      const response = await Authapi.post('verifyqrcode', { verifycode });
      const responseData = response.data;

      if (responseData.status === 'success') {
        isAuthenticatedRef.current = true;
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('user_info', JSON.stringify(responseData.user_details));
        updateAuthDetails(responseData.user_details, responseData.access_token);
      } else if (responseData.status !== 'pending') {
        setErrorMessage({ message: responseData.message });
      }
    } catch (error) {
      console.error('QR verification error:', error);
    }
  };


  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const data = {
      emailOrPhone: formData.email,
      password: formData.password,
      isEmail: true,
    };

    try {
      const response = await Authapi.post("/user/signin", data);
      const responseData = response.data;

      if (responseData?.user_details?.is_deactivated) {
        setErrorMessage({
          message: "Your account is deactivated. Please contact support.",
        });
        return;
      }

      if (
        responseData.status === "error" ||
        responseData.status === "error_user_not_found" ||
        responseData.status === "error_invalid_password"
      ) {
        setErrorMessage({ message: responseData.message });
        return;
      }

      if (responseData.requiresOtp) {
        setIsOtpModalVisible(true);
        setActiveSection('MODAL');
        setIsLoading(false);
        return;
      }

      localStorage.setItem("access_token", responseData.access_token);
      localStorage.setItem(
        "user_info",
        JSON.stringify(responseData.user_details)
      );

      updateAuthDetails(responseData.user_details, responseData.access_token);
      // Use a timeout to ensure state updates and cleanup effects have time to run
      setTimeout(() => {
        if (navigate) navigate("/browse");
      }, 50);
    } catch (error) {
      setErrorMessage({
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate, updateAuthDetails]);

  useEffect(() => {
    fetchQRCode();

    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!verifycode) return;

    const interval = setInterval(() => {
      handleCheckVerifyCode();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [verifycode]);

  return (
    <div
      className="relative flex flex-col w-screen h-screen bg-cover bg-center text-white font-sans overflow-hidden"
      style={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${background_login})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Header */}
      <BookMyTheatreHeader />

      {/* Modals */}
      {/* {isOtpModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-[#1a1a1a] p-10 rounded-xl w-[550px] text-center border border-gray-700 shadow-xl">
            <p className="text-2xl font-semibold mb-8 leading-snug">
              Please complete the signup process in the mobile app or browser
              before logging in here.
            </p>
            <button
              ref={otpOkButtonRef}
              onClick={() => { setIsOtpModalVisible(false); setActiveSection('FORM'); }}
              className="bg-red-700 hover:bg-red-600 py-3 px-10 rounded-md text-lg font-semibold outline-none focus:ring-4 focus:ring-white"
            >
              OK
            </button>
          </div>
        </div>
      )} */}

      {/* OTP Modal */}
      <Modal
        isOpen={isOtpModalVisible}
        onClose={() => setIsOtpModalVisible(false)}
      >
        <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border border-gray-600">
          <p className="text-white text-2xl mb-8 font-semibold">
            Please complete the signup process in mobile app or browser to login here
          </p>
          <button
            ref={otpOkButtonRef}
            onClick={() => setIsOtpModalVisible(false)}
            className="bg-red-700 hover:bg-red-800 py-3 px-12 rounded-md text-white font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordModalVisible}
        onClose={() => setIsForgotPasswordModalVisible(false)}
      >
        <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border border-gray-600">
          <p className="text-white text-2xl mb-8 font-semibold">
            Forgot your password? <br />
            Reset it using your browser at<br />
            <span className="underline">https://uat.bookmytheatre.com/login</span>
          </p>
          <button
            onClick={() => setIsForgotPasswordModalVisible(false)}
            className="bg-red-700 hover:bg-red-800 py-3 px-12 rounded-md text-white font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Session Timeout Modal */}
      <Modal
        isOpen={isSessionTimeoutModalVisible}
        onClose={() => { }}
        preventClose={true}
      >
        <div className="bg-gray-800 p-10 rounded-lg w-[600px] text-center border-2 border-red-600">
          <p className="text-red-500 text-3xl font-bold mb-4">
            ⏱️ Session Timed Out
          </p>
          <p className="text-white text-2xl mb-6 font-semibold">
            Your session has expired after 10 minutes of inactivity.
          </p>
          <p className="text-gray-300 text-xl mb-8">
            A new QR code will be generated automatically in{' '}
            <span className="text-red-500 font-bold text-2xl">{countdown}</span> seconds...
          </p>
          <div className="bg-gray-700 h-2 w-full rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-1000"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </Modal>


      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-row items-stretch">
        {/* Left Section */}
        
        <div className="flex-1 p-16 flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold mb-3 text-center">
            Login to your account
          </h1>
          <h2 className="text-white text-xl font-semibold mb-2 text-center">
            Scan QR code
          </h2>
          <p className="text-gray-300 text-base mb-4 text-center">
            Use your mobile device's camera or a QR scanner to get started.
          </p>

          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-full h-[200px] object-contain"
            />
          )}

          <div className="mt-6 flex flex-col items-center">
            <div className="flex flex-row justify-center bg-[#1e1e1e] px-6 py-4 rounded-xl border border-gray-600">
              <span
                className="text-white text-4xl font-extrabold tracking-[0.375rem] mx-1"
                style={{ fontFamily: 'monospace' }}
              >
                {verifycode}
              </span>
            </div>

            <p className="text-gray-400 text-base mt-3 text-center">
              Enter this code on your mobile device to verify the TV login.
            </p>
          </div>

          <p className="text-gray-400 text-base mt-4 text-center">
            Keep the QR code clearly visible. This page will automatically update when the connection is established
          </p>
        </div>


        {/* Right Section */}
        {/* <div className="flex-1 flex flex-col justify-center px-20 py-12 bg-black/40 backdrop-blur-sm">
          <h2 className="text-3xl font-semibold mb-4">Sign in with Email</h2>
          <p className="text-gray-300 text-lg mb-8">
            Enter your registered email and password below to continue.
          </p>

          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2">
              Email Address
            </label>
            <input
              ref={el => formRefs.current[0] = el}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              className={`w-full bg-transparent border-b-2 text-white text-lg py-3 outline-none transition-all duration-200 ${focusedIndex === 0 ? 'border-red-600' : 'border-gray-500'}`}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              ref={el => formRefs.current[1] = el}
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              className={`w-full bg-transparent border-b-2 text-white text-lg py-3 outline-none transition-all duration-200 ${focusedIndex === 1 ? 'border-red-600' : 'border-gray-500'}`}
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-lg mb-6">{errorMessage.message}</p>
          )}

          <motion.button
            onClick={handleLogin}
            ref={el => formRefs.current[3] = el}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full bg-red-700 hover:bg-red-600 py-4 rounded-lg text-xl font-bold tracking-wide shadow-xl transition outline-none ${focusedIndex === 3 ? 'ring-4 ring-white' : ''}`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </motion.button>
        </div> */}

        <div className="flex-1 p-16 flex flex-col justify-center border-l border-gray-700/50">
          <h2 className="text-white text-2xl font-semibold mb-4">
            Get started with your email.
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Please enter your email and password to continue.
          </p>

          {/* Email Input */}
          <div
            className={`flex flex-row items-center pb-3 mb-2 border-b-2 transition-colors cursor-pointer ${focusedElement === 'email' ? 'border-red-700' : 'border-gray-400'
              }`}
            onClick={() => handleOpenKeyboard('email')}
          >
            <input
              type="email"
              ref={el => formRefs.current[0] = el}
              readOnly
              onFocus={() => setFocusedElement('email')}
              onBlur={() => setFocusedElement(null)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleOpenKeyboard('email');
              }}
              className="flex-1 bg-transparent text-white text-xl p-0 outline-none placeholder-gray-400"
              placeholder="Enter Email Address"
              value={formData.email}
            />
          </div>
          <p className="text-gray-500 text-sm mb-8">Press Enter or click to open keyboard</p>

          {/* Password Input */}
          <div
            className={`flex flex-row items-center pb-3 mb-2 border-b-2 transition-colors cursor-pointer ${focusedElement === 'password' ? 'border-red-700' : 'border-gray-400'
              }`}
            onClick={() => handleOpenKeyboard('password')}
          >
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              ref={el => formRefs.current[1] = el}
              readOnly
              onFocus={() => setFocusedElement('password')}
              onBlur={() => setFocusedElement(null)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleOpenKeyboard('password');
                }
              }}
              className="flex-1 bg-transparent text-white text-xl p-0 outline-none placeholder-gray-400"
              placeholder="Enter Password"
              value={formData.password}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPasswordVisible(!isPasswordVisible);
              }}
              onFocus={() => setFocusedElement('passwordToggle')}
              onBlur={() => setFocusedElement(null)}
              className={`ml-3 p-2 rounded transition-colors ${focusedElement === 'passwordToggle' ? 'bg-red-700' : 'bg-transparent'
                }`}
            >
              <span className="text-white text-2xl font-bold">
                {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
              </span>
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-8">Press Enter or click to open keyboard</p>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-lg mb-4">
              {errorMessage.message}
            </p>
          )}

          {/* Forgot Password Link */}
          {/* <button
              onClick={() => setIsForgotPasswordModalVisible(true)}
              onFocus={() => setFocusedElement('forgotPassword')}
              onBlur={() => setFocusedElement(null)}
              className={`font-semibold mb-6 ml-auto transition-colors ${
                focusedElement === 'forgotPassword' ? 'text-[#c02628]' : 'text-gray-400'
              }`}
            >
              Forgot password?
            </button> */}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            ref={el => formRefs.current[3] = el}
            onFocus={() => setFocusedElement('loginBtn')}
            onBlur={() => setFocusedElement(null)}
            disabled={isLoading}
            className={`bg-red-700 hover:bg-red-800 py-4 rounded-md shadow-2xl text-white text-xl font-bold text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusedElement === 'loginBtn' ? 'scale-105 border-2 border-white' : ''
              }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={keyboardVisible}
        onClose={handleCloseKeyboard}
        onInput={handleKeyboardInput}
        onBackspace={handleKeyboardBackspace}
        onClear={handleKeyboardClear}
        currentValue={formData[activeInputField] || ''}
      />
    </div>
  );
};

export default LoginPage;

