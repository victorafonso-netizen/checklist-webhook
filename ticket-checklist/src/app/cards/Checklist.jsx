import React, { useState } from "react";
import {
  hubspot,
  Flex,
  Text,
  Checkbox,
  Button,
  Input,
  Divider,
  Heading,
  Box,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => (
  <ChecklistCard context={context} actions={actions} />
));

const INITIAL_TASKS = [
  { id: 1, label: "Tarefa 1", checked: true },
  { id: 2, label: "Tarefa 2", checked: false },
];

const ChecklistCard = ({ actions }) => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [nextId, setNextId] = useState(3);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, checked: !task.checked } : task
      )
    );
  };

  const addTask = () => {
    const trimmed = newTaskLabel.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      { id: nextId, label: trimmed, checked: false },
    ]);
    setNextId((n) => n + 1);
    setNewTaskLabel("");
  };

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.checked).length;
  const totalCount = tasks.length;

  return (
    <Flex direction="column" gap="small">
      {/* Progresso */}
      <Text format={{ fontWeight: "demibold" }} variant="microcopy">
        {completedCount} de {totalCount} concluída{totalCount !== 1 ? "s" : ""}
      </Text>

      <Divider />

      {/* Lista de tarefas */}
      <Flex direction="column" gap="extra-small">
        {tasks.length === 0 && (
          <Text variant="microcopy" format={{ color: "medium" }}>
            Nenhuma tarefa ainda. Adicione uma abaixo.
          </Text>
        )}

        {tasks.map((task) => (
          <Flex key={task.id} direction="row" align="center" justify="between">
            <Checkbox
              name={`task-${task.id}`}
              label={task.label}
              checked={task.checked}
              onChange={() => toggleTask(task.id)}
            />
            <Button
              variant="secondary"
              size="xs"
              onClick={() => removeTask(task.id)}
            >
              Remover
            </Button>
          </Flex>
        ))}
      </Flex>

      <Divider />

      {/* Adicionar nova tarefa */}
      <Flex direction="row" gap="small" align="end">
        <Box flex={1}>
          <Input
            label="Nova tarefa"
            name="new-task"
            placeholder="Ex: Verificar documentação"
            value={newTaskLabel}
            onChange={(val) => setNewTaskLabel(val)}
            onEnterPressed={addTask}
          />
        </Box>
        <Button
          variant="primary"
          onClick={addTask}
          disabled={!newTaskLabel.trim()}
        >
          Adicionar
        </Button>
      </Flex>
    </Flex>
  );
};
