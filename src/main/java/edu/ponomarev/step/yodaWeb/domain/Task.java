package edu.ponomarev.step.yodaWeb.domain;

import edu.ponomarev.step.yodaWeb.dto.TaskContainer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;
  private boolean completed;
  private String statement;

  private LocalDateTime dateOfCreation;
  private LocalDateTime dateOfFinish;

  @ManyToOne
  private User creator;
  @Enumerated(EnumType.STRING)
  private TaskContainer container;
}
