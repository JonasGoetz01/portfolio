import Picture from "./_components/picture";
import Github from "./_components/github";
import Linkedin from "./_components/linkedin";
import Mail from "./_components/mail";

export default function Home() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 md:gap-6 items-center justify-center mt-16 md:mt-24 px-2 sm:px-4 w-full max-w-2xl md:max-w-3xl mx-auto">
        <div className="flex flex-col gap-4 items-center md:items-start flex-shrink-0">
          <Picture />
        </div>
        <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left min-w-0 flex-1">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold break-words w-full max-w-full">I'm Jonas Götz</p>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-md w-full sm:w-auto">I'm a software engineer and system administrator</p>
          <div className="flex flex-row flex-wrap gap-4 items-center w-full justify-center md:justify-start px-0 sm:px-2">
            <div className="scale-110 sm:scale-100 origin-center">
              <Github />
            </div>
            <div className="scale-110 sm:scale-100 origin-center">
              <Linkedin />
            </div>
            <div className="scale-110 sm:scale-100 origin-center">
              <Mail />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
