INSERT INTO public.reglas_westgard (nombre,descripcion,tipo_accion,causa_probable,recomendacion,activa) VALUES
	 ('1_3s','Un valor excede ±3 desviaciones estándar de la media','rechazo','Error sistemático o aleatorio grave','Repetir control y verificar calibración',true),
	 ('2_2s','Dos valores consecutivos exceden ±2 DS del mismo lado','rechazo','Tendencia o error sistemático','Revisar tendencia y calibrar si es necesario',true),
	 ('R_4s','Diferencia entre dos valores consecutivos >4 DS','rechazo','Error aleatorio excesivo','Verificar técnica de pipeteo y mezclado',true),
	 ('4_1s','Cuatro valores consecutivos exceden ±1 DS del mismo lado','advertencia','Tendencia leve','Monitorear de cerca',true),
	 ('10x','Diez valores consecutivos del mismo lado de la media','rechazo','Error sistemático severo','Detener y revisar calibración inmediatamente',true),
	 ('1_2s','Un punto excede las 2 desviaciones estándar','ADVERTENCIA','Error aleatorio inicial','Monitorear el analito',true);
