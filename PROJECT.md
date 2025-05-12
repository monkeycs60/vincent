# Vincendrier

## Description

Vincendrier est un site fun et sans prise de tête qui affiche les dernières images de Vincent générées par l'IA dans des situations cocasses. 
Qui est Vincent ? Vincent est mon collègue dev senior, qui a une cinquantaine d'années. Il est tout le temps habillé en noir, est un dinosaure du dev et adore se plaindre du caractère nullissime de Javascript. C'est un vrai pro du dev : il a tout connu, même le Pascal. Il adore le C++. Il se plaint tout le temps des spécifications dans notre entreprise car notre CEO n'en fait qu'à sa tête et rien n'est réfléchi. Il déteste aussi le CSS. Même s'il aime à se plaindre souvent, au fond, il est très gentil. Il adore balancer des SCUDS. 

## Objectif

Le but est d'avoir une interface minimaliste et très accrochante/fun et de pouvoir voir en grand la dernière image de Vincent générée par l'IA (un cron job enverra une requête à chat gpt image chaque jour à midi). Sous chaque image, on peut lire une punchline de Vincent reliée au contexte de l'image - cette punchline sera générée par l'IA. Enfin, il y a aura une grid (mansonry ou même plus originale) qui affichera toutes les images de Vincent générées par l'IA sous forme de scroll infini dans l'ordre antéchronologique. Tout le contenu du site tient sur une seule page (/). 

## Stack

- NextJS 15 avec Server Actions + next safe action
- TailwindCSS
- Shadcn UI
- Lucide Icons
- Vercel
- Prisma
- Zustand
- React Hook Form
- Zod
- Vercel AI SDK
