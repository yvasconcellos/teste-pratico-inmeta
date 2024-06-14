import { jwtDecode } from "jwt-decode";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const token = localStorage.getItem("token");

    if (token && isTokenValid(token) && to.path === "/login") {
      return navigateTo("/");
    }

    if (!token && !isPublicRoute(to.path)) {
      return navigateTo("/login");
    }

    if (token && !isTokenValid(token) && !isPublicRoute(to.path)) {
      return navigateTo("/login");
    }
  }

  function isPublicRoute(routePath) {
    const publicRoutes = ["/login", "/register"];
    return publicRoutes.includes(routePath);
  }

  function isTokenValid(token) {
    try {
      const decodedToken = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }
});
