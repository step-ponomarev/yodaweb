package edu.ponomarev.step.yodaWeb.controller;

import edu.ponomarev.step.yodaWeb.dto.UserDto;
import edu.ponomarev.step.yodaWeb.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("register")
  public boolean registerNew(@RequestBody UserDto userDto) {
    return userService.addUser(userDto);
  }

  @GetMapping("user")
  public UserDto currentUser() {
    return userService.currentUser();
  }
}
