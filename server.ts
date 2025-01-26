import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { walk } from "https://deno.land/std@0.204.0/fs/walk.ts";
import { extname } from "https://deno.land/std@0.204.0/path/mod.ts";
import ExifImage from "npm:exif";

const IMAGE_DIR = "D:/irck1/OneDrive/Imágenes/Menta/2025 DUMP";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif"]);

interface ImageMetadata {
    date: string;
    camera?: string;
    iso?: string;
    exposure?: string;
    aperture?: string;
}

async function getImageMetadata(filePath: string): Promise<ImageMetadata | null> {
    return new Promise((resolve) => {
        try {
            new ExifImage({ image: filePath }, function (error: Error, exifData: any) {
                if (error) {
                    console.error('Error parsing EXIF:', error.message);
                    // Fallback a la fecha del sistema
                    Deno.stat(filePath).then(stats => {
                        const date = new Date(stats.mtime);
                        resolve({
                            date: `2025-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        });
                    }).catch(err => {
                        console.error('Error getting file stats:', err);
                        resolve(null);
                    });
                    return;
                }

                try {
                    const metadata: ImageMetadata = {
                        date: '2025-01-01', // valor por defecto
                        camera: exifData.image?.Model || 'Unknown',
                        iso: exifData.exif?.ISO?.toString() || 'Unknown',
                        exposure: exifData.exif?.ExposureTime?.toString() || 'Unknown',
                        aperture: exifData.exif?.FNumber ? `f/${exifData.exif.FNumber}` : 'Unknown'
                    };

                    if (exifData?.exif?.DateTimeOriginal) {
                        const dateStr = exifData.exif.DateTimeOriginal;
                        const [datePart] = dateStr.split(' ');
                        const [year, month, day] = datePart.split(':');
                        metadata.date = `2025-${month}-${day}`;
                    }

                    resolve(metadata);
                } catch (parseError) {
                    console.error('Error parsing date:', parseError);
                    // Fallback a la fecha del sistema
                    Deno.stat(filePath).then(stats => {
                        const date = new Date(stats.mtime);
                        resolve({
                            date: `2025-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        });
                    }).catch(err => {
                        console.error('Error getting file stats:', err);
                        resolve(null);
                    });
                }
            });
        } catch (initError) {
            console.error('Error initializing ExifImage:', initError);
            // Fallback a la fecha del sistema
            Deno.stat(filePath).then(stats => {
                const date = new Date(stats.mtime);
                resolve({
                    date: `2025-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                });
            }).catch(err => {
                console.error('Error getting file stats:', err);
                resolve(null);
            });
        }
    });
}

async function getImagesByDate() {
    const images: { [key: string]: Array<{ path: string; metadata: ImageMetadata }> } = {};
    try {
        for await (const entry of walk(IMAGE_DIR, { 
            includeDirs: false,
            exts: ["jpg", "jpeg", "png", "gif", "JPG"],
        })) {
            const metadata = await getImageMetadata(entry.path);
            if (metadata) {
                const dateStr = metadata.date;
                if (!images[dateStr]) {
                    images[dateStr] = [];
                }
                images[dateStr].push({
                    path: entry.path,
                    metadata: metadata
                });
            }
        }
    } catch (error) {
        console.error("Error al leer el directorio de imágenes:", error);
    }
    return images;
}

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
        return new Response(await Deno.readTextFile("index.html"), {
            headers: { "content-type": "text/html" },
        });
    }

    if (url.pathname === "/day.html") {
        return new Response(await Deno.readTextFile("day.html"), {
            headers: { "content-type": "text/html" },
        });
    }

    if (url.pathname === "/month.html") {
        return new Response(await Deno.readTextFile("month.html"), {
            headers: { "content-type": "text/html" },
        });
    }

    // Servir archivos estáticos de CSS y JS
    if (url.pathname.startsWith("/css/") || url.pathname.startsWith("/js/")) {
        try {
            const file = await Deno.readFile(`.${url.pathname}`);
            const contentType = url.pathname.endsWith('.css') ? 'text/css' : 'application/javascript';
            return new Response(file, {
                headers: { "content-type": contentType },
            });
        } catch (error) {
            return new Response("Not Found", { status: 404 });
        }
    }
    
    if (url.pathname === "/api/images") {
        const images = await getImagesByDate();
        return new Response(JSON.stringify(images), {
            headers: { "content-type": "application/json" },
        });
    }
    
    if (url.pathname.startsWith("/images/")) {
        const imagePath = decodeURIComponent(url.pathname.replace("/images/", ""));
        const fullPath = `${IMAGE_DIR}/${imagePath}`;
        
        try {
            const file = await Deno.readFile(fullPath);
            const ext = extname(fullPath).toLowerCase();
            const contentType = ext === ".jpg" || ext === ".jpeg" 
                ? "image/jpeg" 
                : ext === ".png" 
                    ? "image/png" 
                    : "image/gif";
            
            return new Response(file, {
                headers: { "content-type": contentType },
            });
        } catch (error) {
            console.error("Error al leer imagen:", error);
            return new Response("Imagen no encontrada", { status: 404 });
        }
    }
    
    return new Response("Not Found", { status: 404 });
}

console.log("Servidor corriendo en http://localhost:8000");
await serve(handler, { port: 8000 });
