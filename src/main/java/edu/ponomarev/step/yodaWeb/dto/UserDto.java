package edu.ponomarev.step.yodaWeb.dto;

import edu.ponomarev.step.yodaWeb.config.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class UserDto {
  private String username;
  private String password;
  private Set<UserRole> userRole;
}
