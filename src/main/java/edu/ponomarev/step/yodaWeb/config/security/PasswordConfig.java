package edu.ponomarev.step.yodaWeb.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
  @Bean
  @Scope("singleton")
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
  }
}
