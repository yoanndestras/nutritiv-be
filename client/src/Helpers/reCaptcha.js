// export const callback = (key) => {
//   console.log("callback !!!!!");
//   window.grecaptcha.ready(_ => {
//     window.grecaptcha
//       .execute(key, { action: "submit" })
//       .then(token => {
//         console.log('# reCaptcha token :', token)
//     })
//   })
// }

// export default function reCaptcha(key) {
//   const id = "recaptcha-script"
//   const reCaptchaScript = document.getElementById(id)
  
//   if(!reCaptchaScript) {
//     const script = document.createElement('script');
//     script.src = `https://www.google.com/recaptcha/api.js?render=${key}`
//     script.id = id
//     document.body.appendChild(script);
    
//     script.onLoad = () => {
//       callback && callback();
//     }
//   }
  
//   if(reCaptchaScript && callback) {
//     callback();
//   }
// }