import {
  Fn,
  Stack,
  StackProps,
  aws_logs as logs,
  aws_sns as sns,
  aws_sns_subscriptions as sns_subscriptions,
  aws_iam as iam,
  aws_stepfunctions as sfn,
  aws_stepfunctions_tasks as tasks,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface ChangeSubjectOfEmailNotificationsStackProps extends StackProps {
  emailAddress: string;
}

export class ChangeSubjectOfEmailNotificationsStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ChangeSubjectOfEmailNotificationsStackProps
  ) {
    super(scope, id, props);

    // SNS Email
    const emailSnsTopic = new sns.Topic(this, "EmailSnsTopic");
    emailSnsTopic.addSubscription(
      new sns_subscriptions.EmailSubscription(props.emailAddress)
    );

    const stackUniqueId = Fn.select(2, Fn.split("/", this.stackId));

    // CloudWatch Logs for State Machines
    const changeSubjectEmailNotificationStateMachineLogGroup =
      new logs.LogGroup(
        this,
        "ChangeSubjectEmailNotificationStateMachineLogGroup",
        {
          logGroupName: `/aws/vendedlogs/states/changeSubjectEmailNotificationStateMachineLogGroup-${stackUniqueId}`,
          retention: logs.RetentionDays.TWO_WEEKS,
        }
      );

    // Change subject of email notification State Machine
    const publishSns = new tasks.CallAwsService(this, "PublishSns", {
      service: "sns",
      action: "publish",
      parameters: {
        TopicArn: emailSnsTopic.topicArn,
        "Message.$": "$.message",
        "Subject.$": "$.subject",
      },
      iamResources: [emailSnsTopic.topicArn],
    });

    new sfn.StateMachine(this, "ChangeSubjectEmailNotificationStateMachine", {
      definition: publishSns,
      logs: {
        destination: changeSubjectEmailNotificationStateMachineLogGroup,
        level: sfn.LogLevel.ALL,
      },
      tracingEnabled: true,
    });
  }
}
