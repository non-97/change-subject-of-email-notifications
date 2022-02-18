#!/usr/bin/env node
import "source-map-support/register";
import "dotenv/config";
import * as cdk from "aws-cdk-lib";
import { ChangeSubjectOfEmailNotificationsStack } from "../lib/change-subject-of-email-notifications-stack";

const app = new cdk.App();

// If the variable specified by dotenv is not defined, the process is aborted
if (process.env.EMAIL_ADDRESS === undefined) {
  console.error(`
    There is not enough input in the .env file.
    Please enter a value in the .env file.`);
  process.exit(1);
}

new ChangeSubjectOfEmailNotificationsStack(
  app,
  "ChangeSubjectOfEmailNotificationsStack",
  {
    emailAddress: process.env.EMAIL_ADDRESS,
  }
);
