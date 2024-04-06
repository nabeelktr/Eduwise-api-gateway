import 'dotenv/config'

export default {
    rabbitMQ: {
      url: String(process.env.RabbitMQ_Link),
      queues: {
        instructorQueue: "instructor_queue",
        courseQueue: "course_queue",
        adminQueue: "admin_queue"
      },
    },
  };