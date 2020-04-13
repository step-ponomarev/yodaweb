package edu.ponomarev.step.yodaWeb.dto;

import edu.ponomarev.step.yodaWeb.domain.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskDto {
  private Long id;
  private boolean completed;
  private String statement;

  private LocalDateTime dateOfCreation;
  private LocalDateTime dateOfFinish;

  private User creator;
  private TaskContainer container;
}
