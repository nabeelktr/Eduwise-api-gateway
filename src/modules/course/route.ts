import express,{Application} from 'express'
import multer from 'multer';
import courseController from './controller';
import { isValidated } from '../auth/controller';

const storage = multer.memoryStorage()
const upload = multer({storage})
const courseRoute:Application = express();

const controller = new courseController();


courseRoute.post('/create-course', isValidated, upload.single('thumbnail'), controller.createCourse )
courseRoute.get('/get-courses', isValidated, controller.getCourses)
courseRoute.post('/update-course', isValidated, upload.single("thumbnail"), controller.updateCourse)
courseRoute.delete('/delete-course/:id', isValidated, controller.deleteCourse)
courseRoute.get('/get-course-wop/:id', controller.getSingleCourse)
courseRoute.get('/get-course-content/:id', controller.getCourseContent)
courseRoute.get('/get-all-courses', controller.getAllCourses)
courseRoute.get('/get-trending-courses', controller.getTrendingCourses)



export default courseRoute
