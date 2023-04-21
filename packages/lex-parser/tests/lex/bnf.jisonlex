ID1		[a-zA-Z]
IDN             {ID1}|[0-9_-]
ID              {ID1}{IDN}*

%%
\s+		{/* skip whitespace */}
"/*"[^*]*"*"	{return yy.lexComment(this);}
{ID}            {return 'ID';}
'"'[^"]+'"'	{yytext = yytext.substr(1, yyleng-2); return 'STRING';}
"'"[^']+"'"	{yytext = yytext.substr(1, yyleng-2); return 'STRING';}
":"		{return ':';}
";"		{return ';';}
"|"		{return '|';}
"%%"		{return '%%';}
"%prec"		{return 'PREC';}
"%start"	{return 'START';}
"%left"		{return 'LEFT';}
"%right"	{return 'RIGHT';}
"%nonassoc"	{return 'NONASSOC';}
"%"{ID1}+[^\n]*	{/* ignore unrecognized decl */}
"{{"[^}]*"}"	{return yy.lexAction(this);}
"{"[^}]*"}"	{yytext = yytext.substr(1, yyleng-2); return 'ACTION';}
"<"[^>]*">"	{yytext = yytext.substr(1, yyleng-2); return 'ACTION';}
.		{/* ignore bad characters */}
<<EOF>>		{return 'EOF';}

