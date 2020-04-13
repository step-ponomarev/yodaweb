package edu.ponomarev.step.yodaWeb.config.security;

import edu.ponomarev.step.yodaWeb.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
  private final UserService userService;

  private final PasswordEncoder passwordEncoder;

  public WebSecurityConfig(UserService userService, PasswordEncoder passwordEncoder) {
    this.userService = userService;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf()
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        .and()
        .authorizeRequests()
        .antMatchers("/", "/js/**", "/css/**", "/img/**").permitAll()
        .antMatchers("/registration", "/register").not().authenticated()
        .antMatchers(HttpMethod.GET, "/user").authenticated()
        .antMatchers("/task").authenticated()
        .anyRequest()
        .authenticated()
        .and()
        .formLogin()
            .loginPage("/")
            .passwordParameter("password")
            .usernameParameter("username")
            .defaultSuccessUrl("/")
            .failureUrl("/")
            .loginProcessingUrl("/login")
        .and()
        .rememberMe()
            .key("SUPER_ULTRA_SECRET_KEY") // TODO: ИЗМЕНИТЬ КЛЮЧ
            .rememberMeParameter("remember-me")
            .tokenValiditySeconds((int) TimeUnit.DAYS.toSeconds(21))
        .and()
        .logout()
        .logoutUrl("/logout").permitAll()
        .logoutSuccessUrl("/")
        .deleteCookies("JSESSIONID");
  }

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(this.daoAuthenticationProvider());
  }

  @Bean
  public DaoAuthenticationProvider daoAuthenticationProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setPasswordEncoder(this.passwordEncoder);
    provider.setUserDetailsService(this.userService);

    return provider;
  }
}
