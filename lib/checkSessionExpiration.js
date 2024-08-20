import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const checkSessionExpiration = (router, route) => {
  const expirationTime = localStorage.getItem("expirationTime");
  const User =JSON.parse(localStorage.getItem("user"));
  let Userrole="";


  if (expirationTime && new Date().getTime() > expirationTime) {
    localStorage.clear();
    Cookies.remove("token"); // Remove the token from cookies
    toast.info("Session expired. Please log in again.");
    router.push(`/${route}/login`); // Redirect to login page
  }

  // if(route =="mentor"){
  //   Userrole = "Mentor";
  // }
  // if(route =="mentee"){
  //   Userrole = "Client";
  // }
  // if(route =="admin"){
  //   Userrole = "Admin";
  // }

  // if(User && User.role != Userrole){
  //   localStorage.clear();
  //   Cookies.remove("token"); // Remove the token from cookies
  //   toast.info("Session expired. Please log in again.");
  //   router.push(`/${route}/login`); // Redirect to login page
  // }


};
