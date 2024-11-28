import sys, asyncio
PLAYER_HEIGHT 		= 110
PLAYER_WIDTH 		=	10
BALL_START_SPEED  	= 0.9
PLAYER_SPEED  	= 15
BALL_DELTA_SPEED  	= .1
PLAYER_POS = 20

class   Table:
        width = 1083    
        height = 624
        def __init__(self, tableWidth, tableHeight):

            self.width   = tableWidth
            self.height  = tableHeight
            pass
        
        def to_dict(self):
            return{
                "width" : self.width,
                "height" : self.height
            }


class Player:
    def __init__(self, x, y=None, w=None, h=None):
        if y is None and w is None and h is None:
            self.y = Table.height / 2 - PLAYER_HEIGHT / 2
            self.width = PLAYER_WIDTH
            self.height = PLAYER_HEIGHT
        else:
            self.y = y
            self.width = w
            self.height = h
        
        self.x = x
        self.color = "#fff"
        self.score = 0
        self.is_moving_down = False
        self.is_moving_up = False
        self.name = "anonymous"

    # def __init__(self, x, y, w, h):
    #     self.x = x
    #     self.y          = y
    #     self.width      = w
    #     self.height     = h
    #     self.color      = "#FF00FF"
    #     self.score      = 0
    #     self.name = "anonymous"


    def to_dict(self):
        return {
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "color": self.color,
            "score": self.score,
            "name": self.name
        }

class Net:
    # def __init__(self):
    x      =   Table.width / 2 - 1
    y      =   0
    width  =   1
    height =   20
    color  =   '#857EBB'
    
    def to_dict(self):
        return{
            'x'     :   self.x,
            'y'     :   self.y,
            'width' :   self.width,
            'height':   self.height,
            'color' :   self.color
        }


class Ball:
    
    def __init__(self, x  , y) :

        self.x			=	x
        self.y 			=	y
        self.radius		=	8.5
        self.speed 		=	BALL_START_SPEED
        self.color		=	"#D9D9D9"
        self.velocityX 	=	-4.5
        self.velocityY	=	2.5
        self.hitedPlayer = None
   
    def update(self, lplayer, rplayer, table,tplayer=None):
        ballLeft = self.x - self.radius
        ballRight = self.x + self.radius
        ballTop = self.y + self.radius
        ballButtom = self.y - self.radius

        if ballLeft <= PLAYER_POS :
            self.setScore(lplayer, rplayer, tplayer)
            self.hitedPlayer = lplayer
            resetBall(self, table, 40)
            return
        if ballRight >= table.width - (PLAYER_POS):
            self.setScore(lplayer, rplayer, tplayer)
            self.hitedPlayer = rplayer
            resetBall(self, table, -40)
            return
        if tplayer is not None:
        
            if ballButtom <= PLAYER_POS:
                self.setScore(lplayer, rplayer, tplayer)
                self.hitedPlayer = tplayer
                resetBall(self, table, 40)
                return
            
        if (ballLeft <= (PLAYER_POS + PLAYER_WIDTH) and self.velocityX < 0 and 
            lplayer.y <= self.y <= lplayer.y + PLAYER_HEIGHT):
                    self.velocityX *= -1
                    self.speed      +=  BALL_DELTA_SPEED
                    self.hitedPlayer = lplayer
        
        if ballRight >= table.width - (PLAYER_POS + PLAYER_WIDTH) and self.velocityX > 0 and ballRight < table.width - PLAYER_POS\
            and ballTop >= rplayer.y \
                    and ballButtom <= rplayer.y + (PLAYER_HEIGHT ):
                    self.velocityX *= -1
                    self.speed      +=  BALL_DELTA_SPEED
                    
                    self.hitedPlayer = rplayer
            
        if tplayer is not None:
            if ballButtom <= PLAYER_POS + PLAYER_WIDTH and self.velocityY < 0  \
                and ballRight >= tplayer.x \
                and ballLeft <= tplayer.x + PLAYER_HEIGHT :
                    self.velocityY *= -1
                    self.speed     +=  BALL_DELTA_SPEED
                    self.hitedPlayer = tplayer

        if tplayer is not None:
            if ballButtom >= table.height:
                self.velocityY *= -1
        elif ballTop >= table.height or ballButtom <= 0:
             self.velocityY *= -1
        self.x += self.velocityX * self.speed
        self.y += self.velocityY * self.speed
        
    def setScore(self, lplayer, rplayer, tplayer=None):
        if self.hitedPlayer == None or self.hitedPlayer == rplayer:
            rplayer.score += 1

        if self.hitedPlayer == lplayer:
            lplayer.score += 1
        
        if tplayer is not None:
            if self.hitedPlayer == tplayer:
                tplayer.score += 1
            

        #here a exception for top player
        # if ball.y - PLAYER_POS + PLAYER_HEIGHT \
        #     and ball.x >= tplayer.x  and  ball.x >= tplayer.x + PLAYER_HEIGHT:
        #     ball.velocityX *= -1
        # if ball.y <= 20 + PLAYER_WIDTH:
        #     ball.velocityY *= -1


    def to_dict(sefl):
         return{
              
              'x'           :   sefl.x,
              'y'           :   sefl.y,
              'radius'      :   sefl.radius,
              'speed'       :   sefl.speed,
              'color'       :   sefl.color,
              'velocityX'   :   sefl.velocityX,
              'velocityY'   :   sefl.velocityY
                       
            }

def targetGoalx(ball):
    if ball.x - ball.radius <= 0:
        return True
    if ball.x +  ball.radius >= Table.width :
        return True
    # if ball.y - ball.radius <= PLAYER_POS:
    #     return True
    return False

def targetGoal(ball, tplayer=None):
    ballLeft = ball.x - ball.radius
    ballRight = ball.x + ball.radius
    if ballLeft <= PLAYER_POS :
        
        # ball.velocityY = - ball.velocityY
        return True
    if ballRight >= Table.width - (PLAYER_POS):
        # print("yes", file=sys.stderr)
        # ball.velocityY = - ball.velocityY
        return True
    if tplayer is not None:
        
        if ball.x -  ball.radius <=   0:
            # ball.velocityY = - ball.velocityY
            return True
    # if ball.y - ball.radius <= PLAYER_POS:
    #     return True
    return False

def playerCollision(ball, player):
    if ball.y + ball.radius >= player.y and ball.y - ball.radius <= player.y  + PLAYER_HEIGHT:
        return True
    if ball.x - ball.radius >= player.x and ball.x >= player.y + PLAYER_WIDTH:
        return True
    return False

def collisionMulti(ball):
    if ball.x >= Table.x - PLAYER_WIDTH - 20:
        ball.velocityX *= -1
    if ball.x <= 20 + PLAYER_WIDTH:
        ball.velocityX *= -1
    if ball.y <= 20 + PLAYER_WIDTH:
        ball.velocityY *= -1
    
        pass

def collision(ball, player):
    ball.top      = ball.y - ball.radius
    ball.bottom   = ball.y + ball.radius
    ball.left     = ball.x - ball.radius
    ball.right    = ball.x + ball.radius

    player.top    = player.y
    player.bottom = player.y + player.height
    player.left   = player.x
    player.right  = player.x + player.width 
    collision_detected = (
        ball.right > player.left and ball.bottom > player.top
        and ball.left < player.right and ball.top < player.bottom
    )
    return collision_detected

def alep(a, b, t):
	return (a + (b - a) * t)

def resetBall(ball, table, pos):
    ball.x			=	table.width / 2
    ball.y 			=	table.height / 2
    ball.radius		=	8
    ball.speed 		=	BALL_START_SPEED
    ball.velocityX 	=	- ball.velocityX
    ball.velocityY	=	- ball.velocityY
    

# def gameOver(lplayer, rplayer, winScore):
#     if lplayer.score == winScore:
#         return lplayer
#     elif rplayer.score == winScore:
#         return rplayer
#     else :
#         return None

    
def resetPlayersMulti(lplayer, rplayer, tplayer):
     lplayer.y = Table.height / 2 - PLAYER_HEIGHT / 2
     lplayer.score = 0
     rplayer.y = Table.height / 2 - PLAYER_HEIGHT / 2
     rplayer.score = 0
     tplayer.x = Table.width / 2
     tplayer.score = 0

def resetPlayers(lplayer, rplayer):
     lplayer.y = Table.height / 2 - PLAYER_HEIGHT / 2
     lplayer.score = 0
     rplayer.y = Table.height / 2 - PLAYER_HEIGHT / 2
     rplayer.score = 0

def gameOver(lplayer, rplayer,winScore,  tplayer = None):
    if lplayer.score >= winScore: #and lplayer.score - rplayer.score >= 2
        return lplayer
    elif rplayer.score >= winScore     : #and rplayer.score - lplayer.score >= 2
        return rplayer
    elif tplayer is not None and tplayer.score >= winScore:
        return tplayer
    return None


def     movePlayer(key, lplayer, rplayer, table, tplayer=None):

    key = str(key).lower()
    if key == 'arrowup' and rplayer.y + PLAYER_HEIGHT -  PLAYER_SPEED > PLAYER_HEIGHT:
        rplayer.y -= PLAYER_SPEED
    if key == 'arrowdown' and rplayer.y + PLAYER_SPEED <  table.height -  PLAYER_HEIGHT:
        rplayer.y += PLAYER_SPEED
    if key == 'w' and lplayer.y + PLAYER_HEIGHT -  PLAYER_SPEED > PLAYER_HEIGHT:
        lplayer.y -= PLAYER_SPEED
    if key == 's' and lplayer.y  + PLAYER_SPEED <  table.height -  PLAYER_HEIGHT:
        lplayer.y+= PLAYER_SPEED
    if tplayer is not None:
        if key == '4' and tplayer.y + PLAYER_HEIGHT -  PLAYER_SPEED > PLAYER_HEIGHT:
            tplayer.x -= PLAYER_SPEED
        if key == '6' and tplayer.x  + PLAYER_SPEED <  table.height -  PLAYER_HEIGHT:
            tplayer.x+= PLAYER_SPEED


def movePlayerT(direction, player):
    # Set the player’s direction but don’t move yet
    if direction == 'up':
        player.is_moving_up = True
        player.is_moving_down = False
    elif direction == 'down':
        player.is_moving_down = True
        player.is_moving_up = False
    elif direction == 'stop':
        player.is_moving_up = False
        player.is_moving_down = False
    


# def move(key, player):
     
     
def     movePlayerRemote(key, game_state,lplayerName, currentUser):
    lplayer = game_state['lplayer']
    rplayer = game_state['rplayer']
    table = game_state['table']
    if key == 'ArrowUp':
        if lplayerName == currentUser and  lplayer.y + PLAYER_HEIGHT -  PLAYER_SPEED > PLAYER_HEIGHT:
            lplayer.y -= PLAYER_SPEED
        elif lplayerName != currentUser and  rplayer.y + PLAYER_HEIGHT -  PLAYER_SPEED > PLAYER_HEIGHT:
                rplayer.y -= PLAYER_SPEED
    elif key == 'ArrowDown':
        if lplayerName == currentUser and  lplayer.y + PLAYER_SPEED <  table.height -  PLAYER_HEIGHT:
            lplayer.y += PLAYER_SPEED
        elif lplayerName != currentUser and  rplayer.y + PLAYER_SPEED <  table.height -  PLAYER_HEIGHT:
            rplayer.y += PLAYER_SPEED
            

def getMaxPlayers(tourType):
    numberPlayers = {
        "tour4": 4,
        "tour8": 8,
        "tour16": 16
    }
    return numberPlayers.get(tourType)