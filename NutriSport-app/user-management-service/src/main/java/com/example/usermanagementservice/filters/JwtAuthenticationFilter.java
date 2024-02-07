package com.example.usermanagementservice.filters;


import com.example.usermanagementservice.service.AccountService;
import com.example.usermanagementservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
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
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    @Autowired
    private  final AccountService accountService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String autHeader = request.getHeader("Authorization");
        final String jwt;
        final String accountLogin;
        if(StringUtils.isEmpty(autHeader) || !StringUtils.startsWith(autHeader, "Bearer ")){
            filterChain.doFilter(request,response);
            return;}
        jwt = autHeader.substring(7);
        log.debug("JWT - {}",jwt.toString());
        accountLogin = jwtService.extractUserName(jwt);
        if(StringUtils.isNotEmpty(accountLogin) && SecurityContextHolder.getContext().getAuthentication() == null){
            UserDetails userDetails = accountService.userDetailsService().loadUserByUsername(accountLogin);
            if(jwtService.isTokenValid(jwt,userDetails)){
                log.debug("User - {}",userDetails);
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);
            }
        }
        filterChain.doFilter(request,response);
    }
}
