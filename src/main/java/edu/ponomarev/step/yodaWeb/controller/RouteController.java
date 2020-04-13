package edu.ponomarev.step.yodaWeb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/*")
public class ForwardController {
  @GetMapping
  public String registrationPage() {
    return "index";
  }
}
