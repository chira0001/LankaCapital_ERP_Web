package com.lankacapital.server.config;

import com.lankacapital.server.services.EmployeeService;
import com.lankacapital.server.services.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final EmployeeService employeeService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {


       // if (request.getServletPath().equals("/api/v1/auth/refresh")) {
        //    filterChain.doFilter(request, response);
        //    return;
        //}

        if (request.getServletPath().startsWith("/api/v1/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }

//        jwt = authHeader.substring(7);
//        userEmail = jwtService.extractUserName(jwt);

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUserName(jwt);
        } catch (Exception e) {
            System.out.println("JWT ERROR: " + e.getMessage());

            filterChain.doFilter(request, response);
            return;
        }


        if(!userEmail.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null){
            UserDetails userDetails = employeeService.userDetailsService().loadUserByUsername(userEmail);
            /// ///////////////////////////////////////////////
            System.out.println("==================================");
            System.out.println("Authorization Header = " + authHeader);
            System.out.println("Email = " + userEmail);
            System.out.println("Authorities = " + userDetails.getAuthorities());
            System.out.println("Token Valid = " + jwtService.isTokenValid(jwt, userDetails));
            System.out.println("==================================");

            /// ////////////////////////////////////

//            if (jwtService.isTokenValid(jwt, userDetails)){
/////  /////////////////////////////
//                System.out.println("Email = " + userEmail);
//                System.out.println("Authorities = " + userDetails.getAuthorities());
//                System.out.println("Token valid = " + jwtService.isTokenValid(jwt, userDetails));
//
//                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
//                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
//                        userDetails, null, userDetails.getAuthorities()
//                );
//                token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                securityContext.setAuthentication(token);
//                SecurityContextHolder.setContext(securityContext);
//            }


//            if (jwtService.isTokenValid(jwt, userDetails)) {
//
//                System.out.println("Token Valid = true");
//                System.out.println("Authorities = " + userDetails.getAuthorities());
//
//                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
//
//                UsernamePasswordAuthenticationToken token =
//                        new UsernamePasswordAuthenticationToken(
//                                userDetails,
//                                null,
//                                userDetails.getAuthorities()
//                        );
//
//                token.setDetails(
//                        new WebAuthenticationDetailsSource().buildDetails(request)
//                );
//
//                securityContext.setAuthentication(token);
//                SecurityContextHolder.setContext(securityContext);
//
////            }
//             else {
//                System.out.println("Token Valid = false");
//            }

            if (jwtService.isTokenValid(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);

            } else {
                System.out.println("Token invalid or expired");
            }
        }
        filterChain.doFilter(request,response);
    }
}
