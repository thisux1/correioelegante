from ani_file import ani_file

# Abrindo o arquivo .ani
f = ani_file.open("C:/Users/thiago/.vscode/codesnippets/valentine-day-card-main/assets/cursor.ani", "rb")

# Salvando os frames em arquivos .ico
f.saveframestofile("C:/Users/thiago/.vscode/codesnippets/valentine-day-card-main/assets", "cursor")

# Fechando o arquivo
f.close()
