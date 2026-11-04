CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barrio" (
	"nombre" text PRIMARY KEY NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categoria" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activa" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"nombre" text NOT NULL,
	"categoria" text NOT NULL,
	"oficio" text NOT NULL,
	"descripcion" text NOT NULL,
	"barrio" text NOT NULL,
	"horario" text NOT NULL,
	"costoVisita" integer DEFAULT 0 NOT NULL,
	"servicios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"foto" text DEFAULT '' NOT NULL,
	"puntaje" double precision DEFAULT 0 NOT NULL,
	"cantidadResenas" integer DEFAULT 0 NOT NULL,
	"distanciaKm" double precision DEFAULT 2.5 NOT NULL,
	"dias" jsonb DEFAULT '["Lun","Mar","Mié","Jue","Vie"]'::jsonb NOT NULL,
	"anosExperiencia" integer DEFAULT 0 NOT NULL,
	"trabajosRealizados" integer DEFAULT 0 NOT NULL,
	"respuesta" text DEFAULT 'Nuevo en CONFIX' NOT NULL,
	"resenas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"esDemo" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "service_request" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"professionalId" text NOT NULL,
	"professionalUserId" text,
	"professionalNombre" text NOT NULL,
	"items" jsonb NOT NULL,
	"direccion" text NOT NULL,
	"piso" text,
	"fecha" text NOT NULL,
	"franja" text NOT NULL,
	"notas" text,
	"contactoNombre" text NOT NULL,
	"contactoTelefono" text NOT NULL,
	"costoVisita" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'cliente' NOT NULL,
	"esDemo" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profile" ADD CONSTRAINT "professional_profile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_clientId_user_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_professionalUserId_user_id_fk" FOREIGN KEY ("professionalUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;