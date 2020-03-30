package edu.ponomarev.step.yodaWeb.controller;

import edu.ponomarev.step.yodaWeb.domain.User;
import edu.ponomarev.step.yodaWeb.dto.UserDto;
import edu.ponomarev.step.yodaWeb.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("register")
  public void registerNew(@RequestBody UserDto userDto) {
    System.out.println(userDto.getUsername());
    userService.addUser(userDto);
  }

  @GetMapping("user")
  public UserDto currentUser() {
    var principal = (User) SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    return new UserDto(principal.getUsername(), principal.getPassword(), principal.getRoleSet());
  }
}
