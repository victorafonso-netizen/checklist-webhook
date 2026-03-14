import React, { useState } from "react";
import {
  hubspot,
  Flex,
  Text,
  Checkbox,
  Button,
  Input,
  Divider,
  Select,
  DateInput,
  ProgressBar,
  TextArea,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => (
  <ChecklistCard context={context} actions={actions} />
));

const STATUS_OPTIONS = [
  { label: "Backlog", value: "backlog" },
  { label: "Doing", value: "doing" },
  { label: "Blocked", value: "blocked" },
  { label: "Done", value: "done" },
];

const INITIAL_TASKS = [
  {
    id: 1,
    label: "Tarefa 1",
    checked: false,
    status: "backlog",
    startDate: null,
    endDate: null,
    currentNote: "",
    history: [],
  },
  {
    id: 2,
    label: "Tarefa 2",
    checked: false,
    status: "backlog",
    startDate: null,
    endDate: null,
    currentNote: "",
    history: [],
  },
];

const formatDate = () => {
  const now = new Date();
  return now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChecklistCard = ({ actions }) => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [nextId, setNextId] = useState(3);

  const updateTask = (id, changes) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...changes } : task))
    );
  };

  const saveNote = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const trimmed = task.currentNote.trim();
        if (!trimmed) return task;
        return {
          ...task,
          currentNote: "",
          history: [{ text: trimmed, date: formatDate() }, ...task.history],
        };
      })
    );
  };

  const addTask = () => {
    const trimmed = newTaskLabel.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      {
        id: nextId,
        label: trimmed,
        checked: false,
        status: "backlog",
        startDate: null,
        endDate: null,
        currentNote: "",
        history: [],
      },
    ]);
    setNextId((n) => n + 1);
    setNewTaskLabel("");
  };

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.checked).length;
  const totalCount = tasks.length;
  const percentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <Flex direction="column" gap="small">
      {/* Barra de progresso */}
      <Flex direction="row" align="center" gap="small">
        <ProgressBar value={percentage} minLabel="" maxLabel="" />
        <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
          {percentage}%
        </Text>
      </Flex>

      <Text variant="microcopy">
        {completedCount} de {totalCount} concluída{totalCount !== 1 ? "s" : ""}
      </Text>

      <Divider />

      <Flex direction="column" gap="medium">
        {tasks.length === 0 && (
          <Text variant="microcopy" format={{ color: "medium" }}>
            Nenhuma tarefa ainda. Adicione uma abaixo.
          </Text>
        )}

        {tasks.map((task) => (
          <Flex key={task.id} direction="column" gap="extra-small">
            {/* Linha 1: checkbox + nome + remover */}
            <Flex direction="row" align="center" justify="between">
              <Flex direction="row" align="center" gap="extra-small">
                <Checkbox
                  name={`task-${task.id}`}
                  label=""
                  checked={task.checked}
                  onChange={() =>
                    updateTask(task.id, {
                      checked: !task.checked,
                      status: !task.checked ? "done" : "backlog",
                    })
                  }
                />
                <Text
                  format={{
                    strikethrough: task.checked,
                    color: task.checked ? "medium" : "default",
                  }}
                >
                  {task.label}
                </Text>
              </Flex>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => removeTask(task.id)}
              >
                Remover
              </Button>
            </Flex>

            {/* Linha 2: status + datas */}
            <Flex direction="row" gap="small" align="end">
              <Select
                label="Status"
                name={`status-${task.id}`}
                value={task.status}
                options={STATUS_OPTIONS}
                onChange={(val) => updateTask(task.id, { status: val })}
              />
              <DateInput
                label="Início"
                name={`start-${task.id}`}
                value={task.startDate}
                onChange={(val) => updateTask(task.id, { startDate: val })}
              />
              <DateInput
                label="Término"
                name={`end-${task.id}`}
                value={task.endDate}
                onChange={(val) => updateTask(task.id, { endDate: val })}
              />
            </Flex>

            {/* Linha 3: observação + salvar */}
            <Flex direction="column" gap="extra-small">
              <TextArea
                label="Nova observação"
                name={`notes-${task.id}`}
                placeholder="Adicione uma observação..."
                value={task.currentNote}
                onChange={(val) => updateTask(task.id, { currentNote: val })}
              />
              <Flex direction="row" justify="end">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => saveNote(task.id)}
                  disabled={!task.currentNote.trim()}
                >
                  Salvar
                </Button>
              </Flex>
            </Flex>

            {/* Histórico de observações */}
            {task.history.length > 0 && (
              <Flex direction="column" gap="extra-small">
                <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
                  Histórico
                </Text>
                {task.history.map((entry, index) => (
                  <Flex key={index} direction="column" gap="extra-small">
                    <Flex direction="row" justify="between">
                      <Text variant="microcopy" format={{ color: "medium" }}>
                        {entry.date}
                      </Text>
                    </Flex>
                    <Text variant="microcopy">{entry.text}</Text>
                    {index < task.history.length - 1 && <Divider />}
                  </Flex>
                ))}
              </Flex>
            )}

            <Divider />
          </Flex>
        ))}
      </Flex>

      {/* Adicionar nova tarefa */}
      <Flex direction="row" gap="small" align="end">
        <Input
          label="Nova tarefa"
          name="new-task"
          placeholder="Ex: Verificar documentação"
          value={newTaskLabel}
          onChange={(val) => setNewTaskLabel(val)}
          onEnterPressed={addTask}
        />
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
