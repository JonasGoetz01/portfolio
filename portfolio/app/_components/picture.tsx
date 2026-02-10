import Image from "next/image";

export default function Picture() {
    const imageZoom = 1.5;
    const imageSize = 200;
    return (
        <>
            <div style={{
                width: imageSize,
                height: imageSize,
                borderRadius: "50%",
                overflow: "hidden",
                display: "inline-block"
            }}>
                <Image
                src="/jonas.avif"
                alt="Jonas Götz"
                width={imageSize}
                height={imageSize}
                style={{ 
                    objectFit: "cover", 
                    width: "100%", 
                    height: "100%", 
                    transform: `scale(${imageZoom})`
                }}
                />
            </div>
        </>
    );
}