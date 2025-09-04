import os
import shutil
import tempfile
import subprocess
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Simple Docker-based Compiler Runner")

class RunRequest(BaseModel):
    language: str                # "python", "java", "cpp"
    code: str
    stdin: Optional[str] = ""    # optional user input
    timeout_seconds: Optional[int] = 5  # per process timeout (seconds)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development, you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunResponse(BaseModel):
    stdout: str
    stderr: str
    compile_stdout: Optional[str] = None
    compile_stderr: Optional[str] = None
    timed_out: bool = False
    exit_code: Optional[int] = None

def write_file(path: str, content: str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

@app.post("/run", response_model=RunResponse)
def run_code(req: RunRequest):
    language = req.language.lower()
    code = req.code
    stdin = req.stdin or ""
    timeout_seconds = req.timeout_seconds or 5

    if language not in ("python", "java", "cpp"):
        raise HTTPException(status_code=400, detail="Unsupported language. Use 'python', 'java' or 'cpp'.")

    # Create temporary workspace
    workspace = tempfile.mkdtemp(prefix="run_")
    try:
        if language == "python":
            srcname = "code.py"
            write_file(os.path.join(workspace, srcname), code)

            cmd = [
                "docker", "run", "--rm", "-i",
                "--network", "none",
                "--memory", "200m", "--cpus", "0.5",
                "-v", f"{workspace}:/workspace",
                "--workdir", "/workspace",
                "my-python-runner",   # custom image
                "python3", srcname
            ]

            try:
                proc = subprocess.run(cmd,
                                      input=stdin.encode(),
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE,
                                      timeout=timeout_seconds)
                return RunResponse(
                    stdout=proc.stdout.decode(errors="replace"),
                    stderr=proc.stderr.decode(errors="replace"),
                    timed_out=False,
                    exit_code=proc.returncode
                )
            except subprocess.TimeoutExpired:
                return RunResponse(stdout="", stderr="Execution timed out.", timed_out=True)

        elif language == "java":
            srcname = "Main.java"
            write_file(os.path.join(workspace, srcname), code)

            shell_command = (
                "javac Main.java 2> compile_err || true; "
                "if [ -f Main.class ]; then "
                f"timeout {timeout_seconds}s java Main; "
                "else cat compile_err; fi"
            )

            cmd = [
                "docker", "run", "--rm", "-i",
                "--network", "none",
                "--memory", "500m", "--cpus", "0.5",
                "-v", f"{workspace}:/workspace",
                "--workdir", "/workspace",
                "my-java-runner",    # custom image
                "bash", "-lc", shell_command
            ]

            try:
                proc = subprocess.run(cmd,
                                      input=stdin.encode(),
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE,
                                      timeout=timeout_seconds + 2)
                return RunResponse(
                    stdout=proc.stdout.decode(errors="replace"),
                    stderr=proc.stderr.decode(errors="replace"),
                    timed_out=False,
                    exit_code=proc.returncode
                )
            except subprocess.TimeoutExpired:
                return RunResponse(stdout="", stderr="Execution timed out.", timed_out=True)

        elif language == "cpp":
            srcname = "main.cpp"
            write_file(os.path.join(workspace, srcname), code)

            shell_command = (
                "g++ main.cpp -o main.out 2> compile_err || true; "
                "if [ -f main.out ]; then "
                f"timeout {timeout_seconds}s ./main.out; "
                "else cat compile_err; fi"
            )

            cmd = [
                "docker", "run", "--rm", "-i",
                "--network", "none",
                "--memory", "500m", "--cpus", "0.5",
                "-v", f"{workspace}:/workspace",
                "--workdir", "/workspace",
                "my-cpp-runner",     # custom image
                "bash", "-lc", shell_command
            ]

            try:
                proc = subprocess.run(cmd,
                                      input=stdin.encode(),
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE,
                                      timeout=timeout_seconds + 2)
                return RunResponse(
                    stdout=proc.stdout.decode(errors="replace"),
                    stderr=proc.stderr.decode(errors="replace"),
                    timed_out=False,
                    exit_code=proc.returncode
                )
            except subprocess.TimeoutExpired:
                return RunResponse(stdout="", stderr="Execution timed out.", timed_out=True)

    finally:
        try:
            shutil.rmtree(workspace)
        except Exception:
            pass

@app.get("/")
def root():
    return {"message": "Docker-based compiler runner. POST /run with {language, code, stdin (opt)}"}
