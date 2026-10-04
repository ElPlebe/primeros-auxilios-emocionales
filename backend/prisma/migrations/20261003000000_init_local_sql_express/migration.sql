BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(320) NOT NULL,
    [display_name] NVARCHAR(160),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [deleted_at] DATETIME2,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[consent_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [version] NVARCHAR(80) NOT NULL,
    [body_hash] NVARCHAR(128) NOT NULL,
    [published_at] DATETIME2 NOT NULL,
    CONSTRAINT [consent_versions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [consent_versions_version_key] UNIQUE NONCLUSTERED ([version])
);

-- CreateTable
CREATE TABLE [dbo].[user_consents] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [consent_version_id] NVARCHAR(1000) NOT NULL,
    [accepted_at] DATETIME2 NOT NULL CONSTRAINT [user_consents_accepted_at_df] DEFAULT CURRENT_TIMESTAMP,
    [scope] NVARCHAR(80) NOT NULL,
    CONSTRAINT [user_consents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_consents_user_id_consent_version_id_scope_key] UNIQUE NONCLUSTERED ([user_id],[consent_version_id],[scope])
);

-- CreateTable
CREATE TABLE [dbo].[trusted_contacts] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(120) NOT NULL,
    [phone_e164] NVARCHAR(20) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [trusted_contacts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [trusted_contacts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [trusted_contacts_user_id_key] UNIQUE NONCLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[survey_assessments] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [client_id] NVARCHAR(80) NOT NULL,
    [safety_answer] NVARCHAR(20) NOT NULL,
    [distress_before] INT NOT NULL,
    [phq4_score] INT NOT NULL,
    [anxiety_score] INT NOT NULL,
    [depression_score] INT NOT NULL,
    [primary_need] NVARCHAR(40) NOT NULL,
    [level] NVARCHAR(20) NOT NULL,
    [emergency] BIT NOT NULL CONSTRAINT [survey_assessments_emergency_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [survey_assessments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [survey_assessments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [survey_assessments_user_id_client_id_key] UNIQUE NONCLUSTERED ([user_id],[client_id])
);

-- CreateTable
CREATE TABLE [dbo].[custom_exercises] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [client_id] NVARCHAR(80) NOT NULL,
    [title] NVARCHAR(120) NOT NULL,
    [description] NVARCHAR(500) NOT NULL,
    [steps_json] NVARCHAR(2000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [custom_exercises_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [custom_exercises_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [custom_exercises_user_id_client_id_key] UNIQUE NONCLUSTERED ([user_id],[client_id])
);

-- CreateTable
CREATE TABLE [dbo].[exercise_follow_ups] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [client_id] NVARCHAR(80) NOT NULL,
    [exercise_id] NVARCHAR(80) NOT NULL,
    [assessment_id] NVARCHAR(1000),
    [distress_before] INT NOT NULL,
    [distress_after] INT NOT NULL,
    [delta] INT NOT NULL,
    [helpful_rating] INT,
    [helpful_comment] NVARCHAR(500),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [exercise_follow_ups_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [exercise_follow_ups_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [exercise_follow_ups_user_id_client_id_key] UNIQUE NONCLUSTERED ([user_id],[client_id])
);

-- CreateTable
CREATE TABLE [dbo].[emotion_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [client_id] NVARCHAR(80) NOT NULL,
    [log_date] DATETIME2 NOT NULL,
    [emotion] NVARCHAR(40) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [emotion_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [emotion_logs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [emotion_logs_user_id_client_id_key] UNIQUE NONCLUSTERED ([user_id],[client_id])
);

-- CreateTable
CREATE TABLE [dbo].[safety_plan_statuses] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [warning_signs] BIT NOT NULL CONSTRAINT [safety_plan_statuses_warning_signs_df] DEFAULT 0,
    [internal_coping] BIT NOT NULL CONSTRAINT [safety_plan_statuses_internal_coping_df] DEFAULT 0,
    [safe_people_places] BIT NOT NULL CONSTRAINT [safety_plan_statuses_safe_people_places_df] DEFAULT 0,
    [trusted_contact] BIT NOT NULL CONSTRAINT [safety_plan_statuses_trusted_contact_df] DEFAULT 0,
    [professional_help] BIT NOT NULL CONSTRAINT [safety_plan_statuses_professional_help_df] DEFAULT 0,
    [safer_environment] BIT NOT NULL CONSTRAINT [safety_plan_statuses_safer_environment_df] DEFAULT 0,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [safety_plan_statuses_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [safety_plan_statuses_user_id_key] UNIQUE NONCLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[data_export_events] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [data_export_events_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [data_export_events_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[data_deletion_requests] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(30) NOT NULL CONSTRAINT [data_deletion_requests_status_df] DEFAULT 'requested',
    [requested_at] DATETIME2 NOT NULL CONSTRAINT [data_deletion_requests_requested_at_df] DEFAULT CURRENT_TIMESTAMP,
    [completed_at] DATETIME2,
    CONSTRAINT [data_deletion_requests_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_consents_user_id_idx] ON [dbo].[user_consents]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [survey_assessments_user_id_created_at_idx] ON [dbo].[survey_assessments]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [custom_exercises_user_id_created_at_idx] ON [dbo].[custom_exercises]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [exercise_follow_ups_user_id_created_at_idx] ON [dbo].[exercise_follow_ups]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [emotion_logs_user_id_log_date_idx] ON [dbo].[emotion_logs]([user_id], [log_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [data_export_events_user_id_created_at_idx] ON [dbo].[data_export_events]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [data_deletion_requests_user_id_requested_at_idx] ON [dbo].[data_deletion_requests]([user_id], [requested_at]);

-- AddForeignKey
ALTER TABLE [dbo].[user_consents] ADD CONSTRAINT [user_consents_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[user_consents] ADD CONSTRAINT [user_consents_consent_version_id_fkey] FOREIGN KEY ([consent_version_id]) REFERENCES [dbo].[consent_versions]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trusted_contacts] ADD CONSTRAINT [trusted_contacts_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[survey_assessments] ADD CONSTRAINT [survey_assessments_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[custom_exercises] ADD CONSTRAINT [custom_exercises_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[exercise_follow_ups] ADD CONSTRAINT [exercise_follow_ups_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[exercise_follow_ups] ADD CONSTRAINT [exercise_follow_ups_assessment_id_fkey] FOREIGN KEY ([assessment_id]) REFERENCES [dbo].[survey_assessments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[emotion_logs] ADD CONSTRAINT [emotion_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[safety_plan_statuses] ADD CONSTRAINT [safety_plan_statuses_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[data_export_events] ADD CONSTRAINT [data_export_events_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[data_deletion_requests] ADD CONSTRAINT [data_deletion_requests_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

