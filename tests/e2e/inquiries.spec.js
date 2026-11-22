import { expect, test } from "@playwright/test";

test("responde con el asunto y conserva los borradores al guardar una consulta", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.E2E_ALLOW_WRITES !== "1",
    "Requiere una API con base aislada y E2E_ALLOW_WRITES=1.",
  );

  const registration = await request.post("/api/v1/auth/register", {
    data: {
      firstName: "Ana",
      lastName: "Prueba",
      email: `inquiries-${Date.now()}@example.com`,
      phone: "1144445555",
      password: "PruebaSegura123!",
      inviteCode: process.env.E2E_ADMIN_INVITE_CODE,
    },
  });
  expect(registration.status()).toBe(201);
  const { token } = (await registration.json()).data;
  await page.addInitScript(
    (value) => sessionStorage.setItem("pixel-forge-token", value),
    token,
  );

  const subject = "¿Hay GPU? & precio";
  const created = await request.post("/api/v1/inquiries", {
    data: {
      name: "Cliente",
      email: "cliente+gpu@example.com",
      subject,
      message: "Consulta de prueba",
    },
  });
  expect(created.status()).toBe(201);
  const { id } = (await created.json()).data;

  try {
    await page.goto(`/admin/consultas/${id}`);
    const replyHref = `mailto:cliente%2Bgpu@example.com?subject=${encodeURIComponent(subject)}`;
    await expect(page.getByRole("link", { name: "Responder" })).toHaveAttribute(
      "href",
      replyHref,
    );

    const status = page.getByRole("combobox", { name: "Estado" });
    const feedback = page.getByRole("textbox", {
      name: "Comentario de seguimiento",
    });
    const changeStatus = page.getByRole("button", {
      name: "Actualizar estado",
    });
    const saveFeedback = page.getByRole("button", { name: "Guardar feedback" });

    await feedback.fill("  Quiere avanzar 🎮  ");
    await status.selectOption("read");
    await changeStatus.click();
    await expect(
      page.getByText("Estado de la consulta actualizado."),
    ).toBeVisible();
    await expect(feedback).toHaveValue("  Quiere avanzar 🎮  ");

    await status.selectOption("answered");
    await saveFeedback.click();
    await expect(page.getByText("Feedback guardado.")).toBeVisible();
    await expect(feedback).toHaveValue("Quiere avanzar 🎮");
    await expect(status).toHaveValue("answered");

    await page.getByRole("link", { name: "Volver a consultas" }).click();
    const row = page.getByRole("row").filter({ hasText: subject });
    await expect(row.getByText("Quiere avanzar 🎮")).toBeVisible();
    await expect(row.getByText("Leída")).toBeVisible();
    await expect(
      row.getByRole("link", { name: `Responder ${subject}` }),
    ).toHaveAttribute("href", replyHref);

    await row.getByRole("link", { name: subject, exact: true }).click();
    await expect(feedback).toHaveValue("Quiere avanzar 🎮");
    await feedback.fill("🎮".repeat(2001));
    await saveFeedback.click();
    await expect(page.getByText("Usá hasta 2000 caracteres.")).toBeVisible();

    await feedback.fill("Seguimiento actualizado.");
    await saveFeedback.click();
    await expect(page.getByText("Feedback guardado.")).toBeVisible();
    await page.reload();
    await expect(feedback).toHaveValue("Seguimiento actualizado.");

    await feedback.fill(" ");
    await saveFeedback.click();
    await expect(page.getByText("Feedback borrado.")).toBeVisible();
    await page.getByRole("link", { name: "Volver a consultas" }).click();
    await expect(row.getByText("Sin feedback")).toBeVisible();
  } finally {
    const removed = await request.delete(`/api/v1/inquiries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(removed.status()).toBe(204);
  }
});
