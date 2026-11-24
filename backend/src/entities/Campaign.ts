import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import { User } from "./UserEntity";

export enum CampaignStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  PAUSED = "paused",
  FAILED = "failed",
}

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("campaigns")
export class Campaign {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  objective: string;

  @Column({ name: "daily_budget", type: "numeric", precision: 10, scale: 2 })
  dailyBudget: string;

  @Column({ name: "start_date", type: "date" })
  startDate: string;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate: string | null;

  @Column({ type: "enum", enum: CampaignStatus, enumName: "campaigns_status_enum", default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ name: "job_status", type: "enum", enum: JobStatus, nullable: true })
  jobStatus!: JobStatus | null;

  @Column({ name: "google_campaign_id", type: "varchar", nullable: true })
  googleCampaignId!: string | null;

  @Column({ type: "int", default: 0 })
  impressions!: number;

  @Column({ type: "int", default: 0 })
  clicks!: number;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => User, (user) => user.campaigns, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Relation<User>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
