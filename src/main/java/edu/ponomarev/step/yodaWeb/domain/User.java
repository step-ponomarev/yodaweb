package edu.ponomarev.step.yodaWeb.domain;

import edu.ponomarev.step.yodaWeb.config.security.UserRole;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.util.Collection;
import java.util.Set;

@Table(name = "usrs")
@Entity
@Data
public class User implements UserDetails {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;

  @Column(unique = true)
  private String username;

  private String password;

  private boolean isAccountNonExpired;
  private boolean isAccountNonLocked;
  private boolean isCredentialsNonExpired;
  private boolean isEnabled;

  @ElementCollection(targetClass = UserRole.class, fetch = FetchType.EAGER)
  @Enumerated(EnumType.STRING)
  private Set<UserRole> roleSet;

  public User() {

  }

  public User(String username, String password, Set<UserRole> roleset) {
    this.username = username;
    this.password = password;
    this.roleSet = roleset;
    this.isAccountNonExpired = true;
    this.isAccountNonLocked = true;
    this.isCredentialsNonExpired = true;
    this.isEnabled = true;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return roleSet;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.username;
  }

  @Override
  public boolean isAccountNonExpired() {
    return this.isAccountNonExpired;
  }

  @Override
  public boolean isAccountNonLocked() {
    return this.isAccountNonLocked;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return this.isAccountNonExpired;
  }

  @Override
  public boolean isEnabled() {
    return this.isEnabled;
  }
}

