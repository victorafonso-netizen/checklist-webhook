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
  Link,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => (
  <ChecklistCard context={context} actions={actions} />
));

const WEBHOOK_URL =
  "https://api-na1.hubapi.com/automation/v4/webhook-triggers/51207666/D2mTHMY";

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
    currentLink: "",
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
    currentLink: "",
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

const ChecklistCard = ({ context }) => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [nextId, setNextId] = useState(3);

  const dispatchWebhook = async (updatedTasks) => {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: context.crm.objectId,
          portalId: context.portal.id,
          tasks: updatedTasks,
        }),
      });
    } catch (err) {
      console.error("Webhook error:", err);
    }
  };

  const updateTask = (id, changes) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, ...changes } : task
    );
    setTasks(updated);
    dispatchWebhook(updated);
  };

  const saveNote = (id) => {
    const updated = tasks.map((task) => {
      if (task.id !== id) return task;
      const trimmed = task.currentNote?.trim();
      const link = task.currentLink?.trim();
      if (!trimmed && !link) return task;
      return {
        ...task,
        currentNote: "",
        currentLink: "",
        history: [
          { text: trimmed, link, date: formatDate() },
          ...(task.history || []),
        ],
      };
    });
    setTasks(updated);
    dispatchWebhook(updated);
  };

  const addTask = () => {
    const trimmed = newTaskLabel.trim();
    if (!trimmed) return;
    const updated = [
      ...tasks,
      {
        id: nextId,
        label: trimmed,
        checked: false,
        status: "backlog",
        startDate: null,
        endDate: null,
        currentNote: "",
        currentLink: "",
        history: [],
      },
    ];
    setTasks(updated);
    setNextId((n) => n + 1);
    setNewTaskLabel("");
    dispatchWebhook(updated);
  };

  const removeTask = (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    dispatchWebhook(updated);
  };

  const completedCount = tasks.filter((t) => t.checked).length;
  const totalCount = tasks.length;
  const percentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <Flex direction="column" gap="small">
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

            <Flex direction="column" gap="extra-small">
              <TextArea
                label="Nova observação"
                name={`notes-${task.id}`}
                placeholder="Adicione uma observação..."
                value={task.currentNote || ""}
                onChange={(val) => updateTask(task.id, { currentNote: val })}
              />
              <Input
                label="Link (opcional)"
                name={`link-${task.id}`}
                placeholder="https://..."
                value={task.currentLink || ""}
                onChange={(val) => updateTask(task.id, { currentLink: val })}
              />
              <Flex direction="row" justify="end">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => saveNote(task.id)}
                  disabled={
                    !task.currentNote?.trim() && !task.currentLink?.trim()
                  }
                >
                  Salvar observação
                </Button>
              </Flex>
            </Flex>

            {(task.history || []).length > 0 && (
              <Flex direction="column" gap="extra-small">
                <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
                  Histórico
                </Text>
                {task.history.map((entry, index) => (
                  <Flex key={index} direction="column" gap="extra-small">
                    <Text variant="microcopy" format={{ color: "medium" }}>
                      {entry.date}
                    </Text>
                    {entry.text ? (
                      <Text variant="microcopy">{entry.text}</Text>
                    ) : null}
                    {entry.link ? (
                      <Link href={entry.link} external>
                        {entry.link}
                      </Link>
                    ) : null}
                    {index < task.history.length - 1 && <Divider />}
                  </Flex>
                ))}
              </Flex>
            )}

            <Divider />
          </Flex>
        ))}
      </Flex>

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
