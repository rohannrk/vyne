-- CreateIndex
CREATE UNIQUE INDEX "ComponentConfig_workspaceId_componentName_key" ON "ComponentConfig"("workspaceId", "componentName");
