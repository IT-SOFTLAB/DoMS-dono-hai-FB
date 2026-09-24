package com.doms.doms.config;
import jakarta.servlet.*;import jakarta.servlet.http.*;import org.springframework.beans.factory.annotation.Value;import org.springframework.http.MediaType;import org.springframework.stereotype.Component;import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;import java.time.Instant;import java.util.concurrent.ConcurrentHashMap;import java.util.concurrent.atomic.AtomicInteger;
@Component public class PublicCreateRateLimitFilter extends OncePerRequestFilter{
 @Value("${app.public-create.rate-limit-per-minute:20}") private int limit;private final ConcurrentHashMap<String,Window> windows=new ConcurrentHashMap<>();
 protected boolean shouldNotFilter(HttpServletRequest r){return !"POST".equals(r.getMethod())||!(r.getRequestURI().equals("/api/public/users")||r.getRequestURI().equals("/api/public/organizations"));}
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{long minute=Instant.now().getEpochSecond()/60;String key=req.getRemoteAddr()+":"+req.getRequestURI();Window w=windows.compute(key,(k,v)->v==null||v.minute!=minute?new Window(minute):v);if(w.count.incrementAndGet()>limit){res.setStatus(429);res.setContentType(MediaType.APPLICATION_JSON_VALUE);res.getWriter().write("{\"error\":\"Too many creation requests; retry later\"}");return;}chain.doFilter(req,res);}
 private static class Window{final long minute;final AtomicInteger count=new AtomicInteger();Window(long m){minute=m;}}
}
