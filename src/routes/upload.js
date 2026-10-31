import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10*1024*1024 } });

export const uploadMiddleware = upload.single('file');

export async function uploadHandler(req,res){
  try{
    if(!req.file) return res.status(400).json({error: "No file"});
    
    const file = req.file;
    let text = '';

    if(file.mimetype.includes('pdf')){
      const data = await pdf(fs.readFileSync(file.path));
      text = data.text.slice(0, 10000);
    } else if(file.mimetype.includes('text') || file.originalname.match(/\.(js|json|txt|md|html|css)$/)){
      text = fs.readFileSync(file.path, 'utf8').slice(0,10000);
    } else {
      text = `File uploaded: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}. Ready for vision analysis.`;
    }

    fs.unlinkSync(file.path); // clean

    res.json({
      success: true,
      filename: file.originalname,
      text: text,
      message: `File ${file.originalname} analyzed by Xiong Ai. Now you can ask about it.`
    });
  }catch(e){
    res.status(500).json({error: e.message});
  }
}
