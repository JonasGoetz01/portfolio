import Picture from "./_components/picture";
import Github from "./_components/github";
import Linkedin from "./_components/linkedin";
import Mail from "./_components/mail";

export default function Home() {
  return (
    <>
      <div className="flex flex-row gap-6 items-center justify-center mt-25">
        <div className="flex flex-col gap-2 items-start">
          <Picture />
        </div>
        <div className="flex flex-col gap-2 items-start">
          <p className="text-6xl font-bold">I'm Jonas Götz</p>
          <p className="text-xl text-muted-foreground">I'm a software engineer and system administrator</p>
          <div className="flex flex-row gap-2 items-center">
            <Github />
            <Linkedin />
            <Mail />
          </div>
        </div>
      </div>
    </>
  );
}
