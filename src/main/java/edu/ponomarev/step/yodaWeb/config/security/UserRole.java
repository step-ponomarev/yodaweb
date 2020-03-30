package edu.ponomarev.step.yodaWeb.config.security;

import org.springframework.security.core.GrantedAuthority;

public enum UserRole implements GrantedAuthority {
  ADMIN,
  USER;

  @Override
  public String getAuthority() {
    return name();
  }
}
