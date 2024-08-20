// File: app/api/upload/route.js

import fs from 'fs';
import path from 'path';

// export const config = {
//     runtime: 'nodejs', // Use Node.js runtime instead of experimental-edge
//     api: {
//         bodyParser: false,
//     },
// };

export const runtime = 'nodejs'; // Updated to use the Node.js runtime

export async function POST(req) {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return new Response('Unsupported Media Type', { status: 415 });
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
        return new Response('Bad Request: Missing boundary', { status: 400 });
    }

    try {
        const chunks = [];
        for await (const chunk of req.body) {
            chunks.push(chunk);
        }
        const data = Buffer.concat(chunks);

        // Parse multipart data
        const parts = parseMultipart(data, boundary);

        if (!parts.files.length) {
            return new Response('No file uploaded', { status: 400 });
        }

        const file = parts.files[0];
        const uploadsDir = path.join(process.cwd(), 'public/uploads'); // Store files in a secure directory
        const fileName = `${file.filename}-${Date.now()}${path.extname(file.filename)}`;
        const filePath = path.join(uploadsDir, fileName);

        // Ensure directory exists
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        await fs.promises.writeFile(filePath, file.data);

        // Generate a secure URL
        const Url = `/uploads/${fileName}`;

        return new Response(JSON.stringify({
            message: 'File uploaded successfully',
            url: Url
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        console.error('Error during file upload:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

function parseMultipart(data, boundary) {
    const boundaryString = `--${boundary}`;
    const parts = [];
    let lastIndex = 0;

    while (true) {
        const startIndex = data.indexOf(boundaryString, lastIndex);
        if (startIndex === -1) break;
        const contentStart = startIndex + boundaryString.length + 2;
        const endBoundaryIndex = data.indexOf(boundaryString, contentStart);
        if (endBoundaryIndex === -1) break;
        const contentEnd = endBoundaryIndex - 2;
        const content = data.slice(contentStart, contentEnd);

        parts.push(content);
        lastIndex = endBoundaryIndex;
    }

    return {
        files: parts.map((partContent) => {
            const headersEndIndex = partContent.indexOf('\r\n\r\n');
            const headerContent = partContent.slice(0, headersEndIndex).toString();
            const filenameRegex = /filename="([^"]+)"/;
            const matches = filenameRegex.exec(headerContent);
            if (matches && matches[1]) {
                const filename = matches[1];
                const fileData = partContent.slice(headersEndIndex + 4);
                return { filename, data: fileData };
            }
        }).filter(Boolean)
    };
}
